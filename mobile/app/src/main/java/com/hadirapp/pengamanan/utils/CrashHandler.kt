package com.hadirapp.pengamanan.utils

import android.util.Log
import kotlin.system.exitProcess

/**
 * Global exception handler untuk crash reporting
 * Menangkap uncaught exceptions dan log ke logcat
 */
object CrashHandler {

    private const val TAG = "CrashHandler"

    /**
     * Setup global exception handler
     * Harus dipanggil di Application.onCreate()
     */
    fun setup() {
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e(TAG, "=== UNCAUGHT EXCEPTION ===", throwable)
            Log.e(TAG, "Thread: ${thread.name}", throwable)

            // Log stack trace
            Log.e(TAG, "Stack trace:", throwable)
            throwable.stackTrace.forEach {
                Log.e(TAG, "    at $it")
            }

            // Log cause
            var cause = throwable.cause
            while (cause != null) {
                Log.e(TAG, "Caused by:", cause)
                cause.stackTrace.forEach {
                    Log.e(TAG, "    at $it")
                }
                cause = cause.cause
            }

            // Show crash info (optional, untuk development)
            // Toast.makeText(
            //     AndroidApplication.INSTANCE,
            //     "App crashed: ${throwable.message}",
            //     Toast.LENGTH_LONG
            // ).show()

            // Kill process
            exitProcess(1)
        }
    }
}
