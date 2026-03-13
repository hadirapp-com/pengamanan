package com.hadirapp.pengamanan.data.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.hadirapp.pengamanan.data.repository.LogRepository
import com.hadirapp.pengamanan.data.repository.SyncRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val logRepository: LogRepository,
    private val syncRepository: SyncRepository
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // Sync offline logs first
            logRepository.syncOfflineLogs()

            // Then sync master data (petugas, pos, qr codes)
            syncRepository.syncData()

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    companion object {
        const val WORK_NAME = "sync_worker"
    }
}
