package com.taskmanager

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log

class CallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
        val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_CARRIER_NAME)
        Log.d("CallReceiver declined", "Incoming call from: $incomingNumber")

        if (state == TelephonyManager.EXTRA_STATE_RINGING && incomingNumber != null) {
            Log.d("CallReceiver", "Incoming call from: $incomingNumber")

            // Start service to run in background
            val serviceIntent = Intent(context, CallService::class.java).apply {
                putExtra("number", incomingNumber)
            }
            context.startService(serviceIntent)
        }
    }
}
