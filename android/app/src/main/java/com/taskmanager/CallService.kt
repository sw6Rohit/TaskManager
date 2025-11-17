package com.taskmanager

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

class CallService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val number = intent?.getStringExtra("number")
        Log.d("CallService", "Incoming call in service: $number")

        // Here you could trigger a notification, store the number, or even trigger Headless JS

        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
