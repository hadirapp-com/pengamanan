package com.hadirapp.pengamanan.util

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.annotation.RawRes

class SoundManager(private val context: Context) {

    private val soundPool = SoundPool.Builder()
        .setMaxStreams(1)
        .setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()
        )
        .build()

    private var successSoundId: Int = 0
    private var errorSoundId: Int = 0

    init {
        // Load sounds (will use default system sounds if no custom sounds provided)
        successSoundId = 0 // Will use system default
        errorSoundId = 0 // Will use system default
    }

    fun playSuccess() {
        // Play success beep sound
        playSystemBeep()
        // Short vibration for success
        vibrate(pattern = longArrayOf(0, 100, 50, 100))
    }

    fun playError() {
        // Play error sound (two short beeps)
        playSystemBeep()
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            playSystemBeep()
        }, 150)
        // Longer vibration pattern for error
        vibrate(pattern = longArrayOf(0, 200, 100, 200, 100, 200))
    }

    private fun playSystemBeep() {
        // Use system default notification sound
        try {
            val soundId = soundPool.load(context, android.media.RingtoneManager.TYPE_NOTIFICATION, 1)
            soundPool.setOnLoadCompleteListener { _, _, _ ->
                soundPool.play(soundId, 1.0f, 1.0f, 0, 0, 1.0f)
            }
        } catch (e: Exception) {
            // Fallback: try to play a simple tone
            try {
                soundPool.play(0, 1.0f, 1.0f, 0, 0, 1.0f)
            } catch (e2: Exception) {
                // Ignore, sound failed to play
            }
        }
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
        soundPool.release()
    }
}
