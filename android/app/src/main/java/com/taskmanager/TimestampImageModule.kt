package com.taskmanager

import android.graphics.*
import android.util.Log
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

class TimestampImageModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "TimestampImage"

    @ReactMethod
    fun addTimestamp(
        imagePath: String,
        latitude: Double,
        longitude: Double,
        currentAddress: String,
        officeAddress: String,
        promise: Promise
    ) {
        try {
            val bitmap = BitmapFactory.decodeFile(imagePath)
            val mutableBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true)
            val canvas = Canvas(mutableBitmap)

            // Default paint for most text
            val defaultPaint = Paint().apply {
                color = Color.WHITE
                textSize = 60f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                setShadowLayer(4f, 2f, 2f, Color.BLACK)
            }

            // Special paint for currentAddress (larger and bolder)
            val currentAddressPaint = Paint(defaultPaint).apply {
                textSize = 90f
                typeface = Typeface.create(Typeface.DEFAULT_BOLD, Typeface.BOLD)
            }

            // Timestamp and Lat/Lng text
            val timeStamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            val latLngText = "Lat: %.5f, Lng: %.5f".format(latitude, longitude)

            // Word-safe line splitting (not just 50 characters)
            val currentLines = splitIntoLines(currentAddress, 50)
            val officeLines = splitIntoLines(officeAddress, 50)

            val padding = 40f

            // Build lines and assign correct paint
            val linesToDraw = mutableListOf<Pair<String, Paint>>().apply {
                add("Time: $timeStamp" to defaultPaint)
                add(latLngText to defaultPaint)
                add("Current: ${currentLines[0]}" to currentAddressPaint)
                if (currentLines.size > 1) add(currentLines[1] to currentAddressPaint)
                add("Office: ${officeLines[0]}" to defaultPaint)
                if (officeLines.size > 1) add(officeLines[1] to defaultPaint)
            }

            // Draw text from bottom upward with each line's paint
            var yPosition = bitmap.height.toFloat() - 40f
            linesToDraw.reversed().forEach { (line, paint) ->
                yPosition -= paint.textSize + 10f
                canvas.drawText(line, padding, yPosition, paint)
            }

            // Save the updated image
            val outputFile = File(reactApplicationContext.cacheDir, "timestamped_${System.currentTimeMillis()}.jpg")
            FileOutputStream(outputFile).use { out ->
                mutableBitmap.compress(Bitmap.CompressFormat.JPEG, 100, out)
                out.flush()
            }

            promise.resolve(outputFile.absolutePath)

        } catch (e: Exception) {
            Log.e("TimestampImage", "Error adding timestamp", e)
            promise.reject("ERROR_ADDING_TIMESTAMP", e.message, e)
        }
    }

    private fun splitIntoLines(text: String, maxLength: Int): List<String> {
        return if (text.length <= maxLength) {
            listOf(text)
        } else {
            text.chunked(maxLength).take(2)
        }
    }
}
