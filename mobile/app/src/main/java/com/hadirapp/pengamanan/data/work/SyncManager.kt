package com.hadirapp.pengamanan.data.work

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class SyncManager(private val context: Context) {

    private val workManager = WorkManager.getInstance(context)

    fun schedulePeriodicSync() {
        // Create constraints: only run when connected to internet
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        // Create periodic work request (every 15 minutes)
        val syncWorkRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, // repeat interval
            TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .build()

        // Enqueue the work
        workManager.enqueueUniquePeriodicWork(
            SyncWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP, // Keep existing work if any
            syncWorkRequest
        )
    }

    fun syncNow() {
        // Create one-time work request for immediate sync
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncWorkRequest = androidx.work.OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(constraints)
            .build()

        workManager.enqueue(syncWorkRequest)
    }
}
