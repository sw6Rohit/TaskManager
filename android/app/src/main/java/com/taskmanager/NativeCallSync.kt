package com.taskmanager

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.CallLog
import android.util.Log
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.Executors

object NativeCallSync {
    @JvmField val executor = Executors.newSingleThreadExecutor()
    private fun prefs(context: Context) = context.getSharedPreferences("native_call_sync", Context.MODE_PRIVATE)

    @JvmStatic fun configure(context: Context, userId: String, legacyTimestamp: Double) {
        val preferences = prefs(context)
        val edit = preferences.edit().putString("user", userId)
        if (!preferences.contains("timestamp") && userId.isNotEmpty()) {
            edit.putLong("timestamp", legacyTimestamp.toLong()).putLong("row", Long.MAX_VALUE)
        }
        check(edit.commit()) { "Unable to save sync session" }
    }

    @JvmStatic fun sync(context: Context): Int {
        val preferences = prefs(context)
        val userId = preferences.getString("user", "").orEmpty()
        if (userId.isEmpty() || ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) {
            Log.i("NativeCallSync", "Skipped: login or call-log permission missing")
            return 0
        }
        val timestamp = preferences.getLong("timestamp", 0)
        val row = preferences.getLong("row", -1)
        val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
        var uploaded = 0
        context.contentResolver.query(
            CallLog.Calls.CONTENT_URI,
            arrayOf(CallLog.Calls._ID, CallLog.Calls.DATE, CallLog.Calls.NUMBER, CallLog.Calls.DURATION, CallLog.Calls.TYPE, CallLog.Calls.CACHED_NAME),
            "(${CallLog.Calls.DATE} > ?) OR (${CallLog.Calls.DATE} = ? AND ${CallLog.Calls._ID} > ?)",
            arrayOf(timestamp.toString(), timestamp.toString(), row.toString()),
            "${CallLog.Calls.DATE} ASC, ${CallLog.Calls._ID} ASC"
        )?.use { cursor ->
            while (cursor.moveToNext()) {
                if (Thread.currentThread().isInterrupted) throw InterruptedException()
                if (preferences.getString("user", "") != userId) return uploaded
                val id = cursor.getLong(0)
                val date = cursor.getLong(1)
                val payload = JSONObject()
                    .put("empl_id", userId.toLong())
                    .put("phone_Number", cursor.getString(2).orEmpty())
                    .put("employee_Code", "0").put("role_id", 0)
                    .put("date_Time", format.format(Date(date)))
                    .put("call_Duration", cursor.getLong(3))
                    .put("call_Type", cursor.getInt(4).toString())
                    .put("caller_Name", cursor.getString(5)?.takeIf { it.isNotEmpty() } ?: "Unknown")
                    .put("callerId", "0").put("simNo", "1")
                post(payload)
                // Save each successful row so a later failure does not replay the whole batch.
                check(preferences.edit().putLong("timestamp", date).putLong("row", id).commit())
                uploaded++
            }
        }
        Log.i("NativeCallSync", "Sync complete: uploaded=$uploaded")
        return uploaded
    }

    private fun post(payload: JSONObject) {
        val connection = URL("https://studentapinew.university99.com/api/CallMonitoring/insert-call").openConnection() as HttpURLConnection
        try {
            connection.requestMethod = "POST"
            connection.connectTimeout = 15000
            connection.readTimeout = 20000
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
            val status = connection.responseCode
            Log.i("NativeCallSync", "POST insert-call HTTP $status")
            check(status in 200..299) { "HTTP $status" }
            val body = connection.inputStream.bufferedReader().use { it.readText() }
            if (body.trim().startsWith("{")) {
                check(JSONObject(body).opt("isSuccess") != false) { "API returned isSuccess=false" }
            }
        } finally {
            connection.disconnect()
        }
    }
}
