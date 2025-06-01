package com.taskmanager

import android.content.Context
import android.location.Geocoder
import com.facebook.react.bridge.*
import java.io.IOException
import java.util.Locale

class LocationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext

    override fun getName(): String {
        return "LocationModule"
    }

    @ReactMethod
    fun getAddressFromCoordinates(latitude: Double, longitude: Double, promise: Promise) {
        try {
            val geocoder = Geocoder(context, Locale.getDefault())
            val addresses = geocoder.getFromLocation(latitude, longitude, 1)

            if (!addresses.isNullOrEmpty()) {
                val address = addresses[0]
                val map = Arguments.createMap()

                map.putString("country", address.countryName)
                map.putString("city", address.locality)
                map.putString("postalCode", address.postalCode)
                map.putString("fullAddress", address.getAddressLine(0))

                promise.resolve(map)
            } else {
                promise.reject("NO_ADDRESS", "No address found for given coordinates.")
            }
        } catch (e: IOException) {
            promise.reject("GEO_ERROR", "Failed to get address", e)
        }
    }
}
