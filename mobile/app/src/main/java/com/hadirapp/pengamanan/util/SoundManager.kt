package com.hadirapp.pengamanan.util

import android.content.Context
import android.media.ToneGenerator
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

class SoundManager(private val context: Context) {

    private var toneGenerator: ToneGenerator? = null

    init {
        // Initialize ToneGenerator with max volume
        try {
            toneGenerator = ToneGenerator(android.media.AudioManager.STREAM_MUSIC, 100)
        } catch (e: Exception) {
            // ToneGenerator failed to initialize
            android.util.Log.e("SoundManager", "Failed to initialize ToneGenerator", e)
        }
    }

    fun playSuccess() {
        // Play high-pitched beep for success (no vibration)
        toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP, 200)
    }

    fun playError() {
        // Play two low-pitched beeps for error
        toneGenerator?.startTone(ToneGenerator.TONE_PROP_NACK, 300)
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_NACK, 300)
        }, 350)

        // Longer vibration pattern for error
        vibrate(pattern = longArrayOf(0, 200, 100, 200, 100, 200))
    }

    private fun vibrate(pattern: LongArray) {
        val vibrator = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(pattern, -1)
        }
    }

    fun release() {
        toneGenerator?.release()
    }
}
