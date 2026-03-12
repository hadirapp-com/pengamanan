package com.hadirapp.pengamanan

import android.app.Application
import com.hadirapp.pengamanan.data.worker.SyncManager
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class PengamananApp : Application() {

    @Inject
    lateinit var syncManager: SyncManager

    override fun onCreate() {
        super.onCreate()
        // Schedule periodic sync on app start
        syncManager.schedulePeriodicSync()
    }
}
