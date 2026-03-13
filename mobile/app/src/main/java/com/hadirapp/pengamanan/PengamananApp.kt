package com.hadirapp.pengamanan

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class PengamananApp : Application() {

    override fun onCreate() {
        super.onCreate()
        // TODO: Schedule periodic sync on app start
    }
}
