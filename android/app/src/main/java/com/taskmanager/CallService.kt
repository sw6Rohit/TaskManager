package com.taskmanager

import android.app.job.JobInfo
import android.app.job.JobParameters
import android.app.job.JobScheduler
import android.app.job.JobService
import android.content.ComponentName
import android.content.Context
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.facebook.react.jstasks.HeadlessJsTaskEventListener

/** JobScheduler owns the wake lock and can launch this work while the UI is closed. */
class CallService : JobService(), HeadlessJsTaskEventListener {
    private var parameters: JobParameters? = null
    private var taskContext: HeadlessJsTaskContext? = null
    private var taskId: Int? = null
    private var instanceListener: ReactInstanceEventListener? = null
    private val reactApplication get() = application as ReactApplication

    override fun onStartJob(params: JobParameters): Boolean {
        parameters = params
        val context = if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            reactApplication.reactHost?.currentReactContext
        } else {
            reactApplication.reactNativeHost.reactInstanceManager.currentReactContext
        }
        if (context != null) {
            startSync(context)
        } else {
            val listener = object : ReactInstanceEventListener {
                override fun onReactContextInitialized(context: ReactContext) {
                    UiThreadUtil.runOnUiThread {
                        removeInstanceListener()
                        if (parameters != null) startSync(context)
                    }
                }
            }
            instanceListener = listener
            if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
                reactApplication.reactHost?.let {
                    it.addReactInstanceEventListener(listener)
                    it.start()
                }
            } else {
                reactApplication.reactNativeHost.reactInstanceManager.let {
                    it.addReactInstanceEventListener(listener)
                    if (!it.hasStartedCreatingInitialContext()) it.createReactContextInBackground()
                }
            }
        }
        return true
    }

    private fun startSync(context: ReactContext) {
        val tasks = HeadlessJsTaskContext.getInstance(context)
        taskContext = tasks
        tasks.addTaskEventListener(this)
        taskId = tasks.startTask(HeadlessJsTaskConfig("CallTask", Arguments.createMap(), 120000L, true))
    }

    override fun onHeadlessJsTaskStart(taskId: Int) = Unit

    override fun onHeadlessJsTaskFinish(taskId: Int) {
        if (this.taskId != taskId) return
        val params = parameters
        cleanup()
        if (params != null) jobFinished(params, false)
    }

    override fun onStopJob(params: JobParameters): Boolean {
        cleanup()
        return true
    }

    private fun removeInstanceListener() {
        instanceListener?.let { listener ->
            if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
                reactApplication.reactHost?.removeReactInstanceEventListener(listener)
            } else {
                reactApplication.reactNativeHost.reactInstanceManager.removeReactInstanceEventListener(listener)
            }
        }
        instanceListener = null
    }

    private fun cleanup() {
        removeInstanceListener()
        taskContext?.removeTaskEventListener(this)
        taskContext = null
        taskId = null
        parameters = null
    }

    override fun onDestroy() {
        cleanup()
        super.onDestroy()
    }

    companion object {
        fun schedule(context: Context) {
            val scheduler = context.getSystemService(Context.JOB_SCHEDULER_SERVICE) as JobScheduler
            // Coalesce disconnects: the JS function uploads all unsynced call logs.
            val job = JobInfo.Builder(4101, ComponentName(context, CallService::class.java))
                .setMinimumLatency(2000L)
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .build()
            if (scheduler.schedule(job) == JobScheduler.RESULT_FAILURE) {
                Log.w("CallService", "Unable to schedule call-log sync")
            }
        }
    }
}
