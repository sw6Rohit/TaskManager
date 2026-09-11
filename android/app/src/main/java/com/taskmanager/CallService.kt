package com.taskmanager

import android.app.job.JobInfo
import android.app.job.JobParameters
import android.app.job.JobScheduler
import android.app.job.JobService
import android.content.ComponentName
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.util.concurrent.Future

/** Reads call logs and performs HTTPS uploads without a React Native runtime. */
class CallService : JobService() {
    private var work: Future<*>? = null
    private var active: JobParameters? = null
    private val handler = Handler(Looper.getMainLooper())

    override fun onStartJob(params: JobParameters): Boolean {
        active = params
        Log.i("NativeCallSync", "Native background job started")
        work = NativeCallSync.executor.submit {
            var retry = false
            try {
                NativeCallSync.sync(applicationContext)
                // Dialers may insert the completed row after the disconnect broadcast.
                Thread.sleep(10000)
                NativeCallSync.sync(applicationContext)
            } catch (error: InterruptedException) {
                Thread.currentThread().interrupt()
            } catch (error: Exception) {
                retry = true
                Log.w("NativeCallSync", "Upload failed: ${error.javaClass.simpleName}: ${error.message}")
            } finally {
                handler.post {
                    if (active === params) {
                        active = null
                        jobFinished(params, retry)
                    }
                }
            }
        }
        return true
    }

    override fun onStopJob(params: JobParameters): Boolean {
        active = null
        work?.cancel(true)
        return true
    }

    override fun onDestroy() {
        active = null
        work?.cancel(true)
        super.onDestroy()
    }

    companion object {
        @JvmStatic fun schedule(context: Context) {
            val scheduler = context.getSystemService(Context.JOB_SCHEDULER_SERVICE) as JobScheduler
            val job = JobInfo.Builder(4101, ComponentName(context, CallService::class.java))
                .setMinimumLatency(5000L)
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setBackoffCriteria(30000L, JobInfo.BACKOFF_POLICY_EXPONENTIAL)
                .build()
            Log.i("NativeCallSync", "Schedule result=${scheduler.schedule(job)}")
        }
    }
}
