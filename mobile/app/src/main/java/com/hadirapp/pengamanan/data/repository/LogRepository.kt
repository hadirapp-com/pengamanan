package com.hadirapp.pengamanan.data.repository

import android.util.Log
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
import retrofit2.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LogRepository @Inject constructor(
    private val scanApi: ScanApi,
    private val driver: SqlDriver,
    private val authRepository: AuthRepository
) {
    suspend fun scanQR(
        qrCode: String,
        petugasId: String,
        posId: String,
        qrData: QrCodeModel? = null
    ): Result<LogModel> {
        val API_ENDPOINT = "POST /mobile/scan"

        return try {
            // Get petugas and pos names from local storage
            val petugasNama = authRepository.getSelectedPetugasNama() ?: "Unknown"
            val posNama = authRepository.getSelectedPosNama() ?: "Unknown"
            val posLokasi = authRepository.getSelectedPosLokasi() ?: "Unknown"

            // Create request
            val request = ScanRequest(qrCode, petugasId, posId, "masuk")

            Log.d("API_CALL", "========================================")
            Log.d("API_CALL", "→ SENDING SCAN REQUEST TO API")
            Log.d("API_CALL", "========================================")
            Log.d("API_CALL", "Endpoint: $API_ENDPOINT")
            Log.d("API_CALL", "Method: POST")
            Log.d("API_CALL", "Request Body:")
            Log.d("API_CALL", "  qrCode: $qrCode")
            Log.d("API_CALL", "  petugasId: $petugasId")
            Log.d("API_CALL", "  posId: $posId")
            Log.d("API_CALL", "  tipeScan: masuk")
            Log.d("API_CALL", "----------------------------------------")

            // Always send scan to server (unless offline)
            val response = scanApi.scanQR(request)

            Log.d("API_CALL", "← API RESPONSE RECEIVED")
            Log.d("API_CALL", "----------------------------------------")
            Log.d("API_CALL", "HTTP Status: ${response.code()}")
            Log.d("API_CALL", "Successful: ${response.isSuccessful()}")

            if (response.isSuccessful() && response.body() != null) {
                val data = response.body()!!
                Log.d("API_CALL", "Success: ${data.success}")
                Log.d("API_CALL", "Message: ${data.message}")
                Log.d("API_CALL", "Error: ${data.error}")

                if (data.success && data.data != null) {
                    Log.d("API_CALL", "Response Data:")
                    Log.d("API_CALL", "  Scan ID: ${data.data.scan.id}")
                    Log.d("API_CALL", "  Tipe Scan: ${data.data.tipeScan}")
                    Log.d("API_CALL", "  Scanned At: ${data.data.scan.scannedAt}")
                    Log.d("API_CALL", "  QR Info:")
                    Log.d("API_CALL", "    - Nama: ${data.data.qr.nama}")
                    Log.d("API_CALL", "    - Penanggung Jawab: ${data.data.qr.penanggungJawab}")
                    Log.d("API_CALL", "========================================")

                    // Convert API response to LogModel
                    val log = LogModel(
                        id = data.data.scan.id,
                        qrCode = qrCode,
                        qrNama = data.data.qr.nama,
                        qrPenanggungJawab = data.data.qr.penanggungJawab,
                        qrValidFrom = qrData?.validFrom ?: "",
                        qrValidUntil = qrData?.validUntil ?: "",
                        guestName = data.data.qr.nama,
                        guestType = "Tamu",
                        scanType = if (data.data.tipeScan == "masuk") ScanType.MASUK else ScanType.KELUAR,
                        scannedAt = data.data.scan.scannedAt,
                        petugasJaga = com.hadirapp.pengamanan.data.model.PetugasJagaInfo(petugasId, petugasNama),
                        pos = com.hadirapp.pengamanan.data.model.PosInfo(posId, posNama, posLokasi),
                        synced = true
                    )
                    // Save to local database
                    saveLogLocally(log)
                    Result.success(log)
                } else {
                    Log.e("API_CALL", "❌ API RETURNED FAILURE")
                    Log.e("API_CALL", "========================================")
                    Result.failure(Exception(data.error ?: data.message ?: "Scan failed"))
                }
            } else {
                // Error response - try to read error body
                Log.e("API_CALL", "❌ HTTP ERROR RESPONSE")
                Log.e("API_CALL", "----------------------------------------")
                Log.e("API_CALL", "HTTP Status: ${response.code()}")
                Log.e("API_CALL", "Status Message: ${response.message()}")

                // Try to read error body
                val errorBody = response.errorBody()?.string()
                if (errorBody != null) {
                    Log.e("API_CALL", "Error Body: $errorBody")
                }
                Log.e("API_CALL", "========================================")

                Result.failure(Exception("HTTP ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("API_CALL", "❌ EXCEPTION DURING API CALL")
            Log.e("API_CALL", "========================================")
            Log.e("API_CALL", "Exception: ${e.javaClass.simpleName}")
            Log.e("API_CALL", "Message: ${e.message}")
            Log.e("API_CALL", "Stack Trace: ${e.stackTraceToString()}")
            Log.e("API_CALL", "========================================")

            // Get petugas and pos names from local storage for offline mode
            val petugasNama = authRepository.getSelectedPetugasNama() ?: "Unknown"
            val posNama = authRepository.getSelectedPosNama() ?: "Unknown"
            val posLokasi = authRepository.getSelectedPosLokasi() ?: "Unknown"

            Log.w("API_CALL", "⚠️ OFFLINE MODE - Saving scan locally as unsynced")
            Log.w("API_CALL", "  Log ID: will be generated")
            Log.w("API_CALL", "  synced: false")
            Log.w("API_CALL", "========================================")

            // Save to local database as unsynced (for offline mode)
            val offlineLog = LogModel(
                id = generateOfflineId(),
                qrCode = qrCode,
                qrNama = qrData?.nama ?: "Unknown",
                qrPenanggungJawab = qrData?.penanggungJawab ?: "Unknown",
                qrValidFrom = qrData?.validFrom ?: "",
                qrValidUntil = qrData?.validUntil ?: "",
                guestName = qrData?.nama ?: "Unknown",
                guestType = "Tamu",  // Changed from "GUEST" to "Tamu"
                scanType = ScanType.MASUK,
                scannedAt = Clock.System.now().toString(),
                petugasJaga = com.hadirapp.pengamanan.data.model.PetugasJagaInfo(petugasId, petugasNama),
                pos = com.hadirapp.pengamanan.data.model.PosInfo(posId, posNama, posLokasi),
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

    /**
     * Get count of unsynced logs
     * @return Number of logs that haven't been synced to server
     */
    fun getUnsyncedLogsCount(): Int {
        val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
        return database.logsQueries.selectUnsyncedLogs().executeAsList().size
    }

    suspend fun syncOfflineLogs(): Result<Unit> {
        val API_ENDPOINT = "POST /mobile/scan"

        return try {
            val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
            val unsyncedLogs = database.logsQueries.selectUnsyncedLogs().executeAsList()

            Log.d("SYNC_LOGS", "========================================")
            Log.d("SYNC_LOGS", "🔄 STARTING OFFLINE LOGS SYNC")
            Log.d("SYNC_LOGS", "========================================")
            Log.d("SYNC_LOGS", "Total unsynced logs: ${unsyncedLogs.size}")

            if (unsyncedLogs.isEmpty()) {
                Log.d("SYNC_LOGS", "No unsynced logs to sync")
                Log.d("SYNC_LOGS", "========================================")
                return Result.success(Unit)
            }

            var successCount = 0
            var failureCount = 0

            unsyncedLogs.forEachIndexed { index, log ->
                Log.d("SYNC_LOGS", "")
                Log.d("SYNC_LOGS", "[$index/${unsyncedLogs.size}] Syncing log:")
                Log.d("SYNC_LOGS", "  Log ID: ${log.id}")
                Log.d("SYNC_LOGS", "  QR Code: ${log.qrCode}")
                Log.d("SYNC_LOGS", "  Petugas ID: ${log.petugasJagaId}")
                Log.d("SYNC_LOGS", "  Pos ID: ${log.posId}")

                try {
                    val request = ScanRequest(log.qrCode, log.petugasJagaId, log.posId, "masuk")
                    Log.d("SYNC_LOGS", "  → Sending to: $API_ENDPOINT")

                    val response = scanApi.scanQR(request)

                    if (response.isSuccessful && response.body()?.success == true) {
                        com.hadirapp.pengamanan.db.PengamananDatabase(driver).logsQueries.updateLogSynced(log.id)
                        Log.d("SYNC_LOGS", "  ✅ Sync successful")
                        successCount++
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Log.e("SYNC_LOGS", "  ❌ Sync failed: HTTP ${response.code()}")
                        if (errorBody != null) {
                            Log.e("SYNC_LOGS", "  Error Body: $errorBody")
                        }
                        failureCount++
                    }
                } catch (e: Exception) {
                    Log.e("SYNC_LOGS", "  ❌ Exception: ${e.message}")
                    failureCount++
                }
            }

            Log.d("SYNC_LOGS", "")
            Log.d("SYNC_LOGS", "========================================")
            Log.d("SYNC_LOGS", "🔄 SYNC COMPLETE")
            Log.d("SYNC_LOGS", "========================================")
            Log.d("SYNC_LOGS", "Total: ${unsyncedLogs.size}")
            Log.d("SYNC_LOGS", "Success: $successCount")
            Log.d("SYNC_LOGS", "Failed: $failureCount")
            Log.d("SYNC_LOGS", "========================================")

            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("SYNC_LOGS", "❌ SYNC EXCEPTION: ${e.message}")
            Log.e("SYNC_LOGS", "Stack trace: ${e.stackTraceToString()}")
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
