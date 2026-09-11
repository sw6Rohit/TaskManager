package com.taskmanager

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import android.content.Context
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import com.facebook.react.bridge.*

class SimModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SimModule"
    }

    @ReactMethod
    fun getSimInfo(promise: Promise) {
        try {
            val context = reactApplicationContext
            val subscriptionManager =
                context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager

            val list = subscriptionManager.activeSubscriptionInfoList

            val result = Arguments.createArray()

            list?.forEach { sub: SubscriptionInfo ->
                val map = Arguments.createMap()

                map.putInt("slotIndex", sub.simSlotIndex) // 0 or 1
                map.putString("carrierName", sub.carrierName.toString())
                map.putInt("subscriptionId", sub.subscriptionId)

                val canReadNumber = ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED
                val number = if (canReadNumber) {
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            subscriptionManager.getPhoneNumber(sub.subscriptionId)
                        } else {
                            @Suppress("DEPRECATION")
                            sub.number.orEmpty()
                        }
                    } catch (_: SecurityException) {
                        ""
                    }
                } else ""
                map.putString("phoneNumber", number)
                result.pushMap(map)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SIM_ERROR", e)
        }
    }
}