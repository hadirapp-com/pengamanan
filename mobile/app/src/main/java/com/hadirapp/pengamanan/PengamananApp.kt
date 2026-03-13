package com.hadirapp.pengamanan

import android.app.Application
import android.util.Log
import dagger.hilt.android.HiltAndroidApp
import com.hadirapp.pengamanan.utils.CrashHandler

@HiltAndroidApp
class PengamananApp : Application() {

    override fun onCreate() {
        super.onCreate()

        // Setup crash handler untuk logging uncaught exceptions
        CrashHandler.setup()

        Log.d("PengamananApp", "Application created successfully")
        Log.d("PengamananApp", "Build: ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})")
        Log.d("PengamananApp", "Debug: ${BuildConfig.DEBUG}")
    }
}
