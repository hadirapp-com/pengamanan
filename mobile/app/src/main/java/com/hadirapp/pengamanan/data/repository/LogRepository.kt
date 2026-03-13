package com.hadirapp.pengamanan.data.repository

import app.cash.sqldelight.db.SqlDriver
import com.hadirapp.pengamanan.data.model.LogModel
import com.hadirapp.pengamanan.data.model.QrCodeModel
import com.hadirapp.pengamanan.data.model.ScanRequest
import com.hadirapp.pengamanan.data.model.ScanResponse
import com.hadirapp.pengamanan.data.model.ScanType
import com.hadirapp.pengamanan.data.remote.api.ScanApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.datetime.Clock
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LogRepository @Inject constructor(
    private val scanApi: ScanApi,
    private val driver: SqlDriver
) {
    suspend fun scanQR(
        qrCode: String,
        petugasJagaId: String,
        posId: String,
        qrData: QrCodeModel? = null
    ): Result<LogModel> {
        return try {
            // Always send scan to server (unless offline)
            val response = scanApi.scanQR(
                ScanRequest(qrCode, petugasJagaId, posId, "masuk")
            )
            if (response.success && response.data != null) {
                // Convert API response to LogModel
                val log = LogModel(
                    id = response.data.scan.id,
                    qrCode = qrCode,
                    qrNama = response.data.qr.nama,
                    qrPenanggungJawab = response.data.qr.penanggungJawab,
                    qrValidFrom = qrData?.validFrom ?: "",
                    qrValidUntil = qrData?.validUntil ?: "",
                    guestName = response.data.qr.nama,
                    guestType = "QR",
                    scanType = if (response.data.tipeScan == "masuk") ScanType.MASUK else ScanType.KELUAR,
                    scannedAt = response.data.scan.scannedAt,
                    petugasJaga = com.hadirapp.pengamanan.data.model.PetugasJagaInfo(petugasJagaId, response.data.petugas),
                    pos = com.hadirapp.pengamanan.data.model.PosInfo(posId, response.data.pos, ""),
                    synced = true
                )
                // Save to local database
                saveLogLocally(log)
                Result.success(log)
            } else {
                Result.failure(Exception(response.error ?: response.message ?: "Scan failed"))
            }
        } catch (e: Exception) {
            // Save to local database as unsynced (for offline mode)
            val offlineLog = LogModel(
                id = generateOfflineId(),
                qrCode = qrCode,
                qrNama = qrData?.nama ?: "Unknown",
                qrPenanggungJawab = qrData?.penanggungJawab ?: "Unknown",
                qrValidFrom = qrData?.validFrom ?: "",
                qrValidUntil = qrData?.validUntil ?: "",
                guestName = qrData?.nama ?: "Unknown",
                guestType = "GUEST",
                scanType = ScanType.MASUK,
                scannedAt = Clock.System.now().toString(),
                petugasJaga = com.hadirapp.pengamanan.data.model.PetugasJagaInfo(petugasJagaId, "Unknown"),
                pos = com.hadirapp.pengamanan.data.model.PosInfo(posId, "Unknown", "Unknown"),
                synced = false
            )
            saveLogLocally(offlineLog)
            Result.success(offlineLog)
        }
    }

    private fun saveLogLocally(log: LogModel) {
        com.hadirapp.pengamanan.db.PengamananDatabase(driver).logsQueries.insertLog(
            id = log.id,
            qrCode = log.qrCode,
            qrNama = log.qrNama,
            qrPenanggungJawab = log.qrPenanggungJawab,
            qrValidFrom = log.qrValidFrom,
            qrValidUntil = log.qrValidUntil,
            guestName = log.guestName,
            guestType = log.guestType,
            scanType = log.scanType.name,
            scannedAt = log.scannedAt,
            petugasJagaId = log.petugasJaga.id,
            petugasJagaName = log.petugasJaga.nama,
            posId = log.pos.id,
            posName = log.pos.nama,
            posLocation = log.pos.lokasi,
            synced = if (log.synced) 1L else 0L
        )
    }

    fun getAllLogs(): Flow<List<LogModel>> = flow {
        val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
        emit(database.logsQueries.selectAllLogs().executeAsList().map { it.toModel() })
    }

    fun getLogsByPos(posId: String): Flow<List<LogModel>> = flow {
        val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
        emit(database.logsQueries.selectLogsByPos(posId).executeAsList().map { it.toModel() })
    }

    suspend fun syncOfflineLogs(): Result<Unit> {
        return try {
            val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
            val unsyncedLogs = database.logsQueries.selectUnsyncedLogs().executeAsList()
            unsyncedLogs.forEach { log ->
                try {
                    scanApi.scanQR(
                        ScanRequest(log.qrCode, log.petugasJagaId, log.posId, "masuk")
                    )
                    com.hadirapp.pengamanan.db.PengamananDatabase(driver).logsQueries.updateLogSynced(log.id)
                } catch (e: Exception) {
                    // Continue with next log
                }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Delete a log from local database
     * Only logs that have been synced (synced=true) can be deleted
     * @param logId The ID of the log to delete
     * @return Result<Unit> Success if deleted, Failure if not synced or error
     */
    suspend fun deleteLog(logId: String): Result<Unit> {
        return try {
            val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)

            // Get the log to check if synced
            val log = database.logsQueries.selectLogById(logId).executeAsOneOrNull()

            if (log == null) {
                return Result.failure(Exception("Log not found"))
            }

            // Check if synced - only allow delete if synced = true
            if (log.synced == 0L) {
                return Result.failure(Exception("Tidak bisa menghapus data yang belum disinkronkan ke server"))
            }

            // Delete the log
            database.logsQueries.deleteLog(logId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun generateOfflineId(): String {
        return "offline_${System.currentTimeMillis()}"
    }

    private fun com.hadirapp.pengamanan.db.Logs.toModel(): LogModel {
        return LogModel(
            id = id,
            qrCode = qrCode,
            qrNama = qrNama,
            qrPenanggungJawab = qrPenanggungJawab,
            qrValidFrom = qrValidFrom,
            qrValidUntil = qrValidUntil,
            guestName = guestName,
            guestType = guestType,
            scanType = com.hadirapp.pengamanan.data.model.ScanType.valueOf(scanType),
            scannedAt = scannedAt,
            petugasJaga = com.hadirapp.pengamanan.data.model.PetugasJagaInfo(petugasJagaId, petugasJagaName),
            pos = com.hadirapp.pengamanan.data.model.PosInfo(posId, posName, posLocation),
            synced = synced == 1L
        )
    }
}
