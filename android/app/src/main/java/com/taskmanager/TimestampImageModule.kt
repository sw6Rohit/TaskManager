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

            val paint = Paint().apply {
                color = Color.WHITE
                textSize = 60f
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                setShadowLayer(4f, 2f, 2f, Color.BLACK)
            }

            // Timestamp and LatLng
            val timeStamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            val latLngText = "Lat: %.5f, Lng: %.5f".format(latitude, longitude)

            // Split long addresses into chunks (up to 2 lines)
            val currentLines = if (currentAddress.length > 50)
                currentAddress.chunked(50).take(2)
            else listOf(currentAddress)

            val officeLines = if (officeAddress.length > 50)
                officeAddress.chunked(50).take(2)
            else listOf(officeAddress)

            val padding = 40f
            val lineHeight = paint.textSize + 10f

            // Build list of lines to draw
            val linesToDraw = mutableListOf<String>().apply {
                add("Time: $timeStamp")
                add(latLngText)
                add("Current: ${currentLines[0]}")
                if (currentLines.size > 1) add(currentLines[1])
                add("Office: ${officeLines[0]}")
                if (officeLines.size > 1) add(officeLines[1])
            }

            // Draw from bottom upward
            linesToDraw.reversed().forEachIndexed { index, line ->
                canvas.drawText(line, padding, bitmap.height - (index + 1) * lineHeight, paint)
            }

            // Save updated image
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
}
