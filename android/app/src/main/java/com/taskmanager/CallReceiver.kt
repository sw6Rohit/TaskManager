package com.taskmanager

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.CallLog
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.content.ContextCompat
import org.json.JSONObject

class CallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        val preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val previousState = preferences.getString(STATE_KEY, TelephonyManager.EXTRA_STATE_IDLE)

        if (state == TelephonyManager.EXTRA_STATE_RINGING) {
            @Suppress("DEPRECATION")
            val incomingNumber =
                intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER).orEmpty()
            preferences.edit()
                .putString(NUMBER_KEY, incomingNumber)
                .putLong(STARTED_AT_KEY, System.currentTimeMillis())
                .putBoolean(ACTIVE_CALL_KEY, true)
                .apply()
        } else if (state == TelephonyManager.EXTRA_STATE_OFFHOOK) {
            preferences.edit()
                .putLong(STARTED_AT_KEY, System.currentTimeMillis())
                .putBoolean(ACTIVE_CALL_KEY, true)
                .apply()
        } else if (
            state == TelephonyManager.EXTRA_STATE_IDLE &&
            previousState != TelephonyManager.EXTRA_STATE_IDLE &&
            preferences.getBoolean(ACTIVE_CALL_KEY, false)
        ) {
            val fallbackNumber = preferences.getString(NUMBER_KEY, "").orEmpty()
            val startedAt = preferences.getLong(STARTED_AT_KEY, System.currentTimeMillis())
            val call = readLatestCall(context, fallbackNumber, startedAt)

            CallDetectorModule.publishDisconnectedCall(context, call.toString())
            preferences.edit()
                .putBoolean(ACTIVE_CALL_KEY, false)
                .remove(NUMBER_KEY)
                .remove(STARTED_AT_KEY)
                .apply()
            Log.d("CallReceiver", "Call disconnected: $call")
        }

        preferences.edit().putString(STATE_KEY, state).apply()
    }

    private fun readLatestCall(
        context: Context,
        fallbackNumber: String,
        startedAt: Long
    ): JSONObject {
        var number = fallbackNumber
        var duration = ((System.currentTimeMillis() - startedAt) / 1000).coerceAtLeast(0)
        var callType = "UNKNOWN"
        var timestamp = System.currentTimeMillis()

        if (
            ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CALL_LOG) ==
            PackageManager.PERMISSION_GRANTED
        ) {
            try {
                context.contentResolver.query(
                    CallLog.Calls.CONTENT_URI,
                    arrayOf(
                        CallLog.Calls.NUMBER,
                        CallLog.Calls.DURATION,
                        CallLog.Calls.TYPE,
                        CallLog.Calls.DATE
                    ),
                    null,
                    null,
                    "${CallLog.Calls.DATE} DESC"
                )?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        number = cursor.getString(0) ?: number
                        duration = cursor.getLong(1)
                        callType = when (cursor.getInt(2)) {
                            CallLog.Calls.INCOMING_TYPE -> "INCOMING"
                            CallLog.Calls.OUTGOING_TYPE -> "OUTGOING"
                            CallLog.Calls.MISSED_TYPE -> "MISSED"
                            CallLog.Calls.REJECTED_TYPE -> "REJECTED"
                            else -> "UNKNOWN"
                        }
                        timestamp = cursor.getLong(3)
                    }
                }
            } catch (error: Exception) {
                Log.w("CallReceiver", "Unable to read latest call log", error)
            }
        }

        return JSONObject()
            .put("phoneNumber", number)
            .put("duration", duration)
            .put("callType", callType)
            .put("timestamp", timestamp)
    }

    companion object {
        private const val PREFS_NAME = "call_state"
        private const val STATE_KEY = "last_phone_state"
        private const val NUMBER_KEY = "active_phone_number"
        private const val STARTED_AT_KEY = "call_started_at"
        private const val ACTIVE_CALL_KEY = "has_active_call"
    }
}
