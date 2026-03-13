package com.hadirapp.pengamanan.data.repository

import app.cash.sqldelight.db.SqlDriver
import com.hadirapp.pengamanan.data.remote.api.SyncApi
import com.hadirapp.pengamanan.data.model.PetugasModel
import com.hadirapp.pengamanan.data.model.PosModel
import com.hadirapp.pengamanan.data.model.QrCodeModel
import javax.inject.Inject
import javax.inject.Singleton
import android.util.Log

@Singleton
class SyncRepository @Inject constructor(
    private val syncApi: SyncApi,
    private val driver: SqlDriver
) {
    suspend fun syncData(): Result<Unit> {
        val API_ENDPOINT = "GET /mobile/sync"

        return try {
            Log.d("SYNC_DATA", "========================================")
            Log.d("SYNC_DATA", "🔄 STARTING MANUAL DATA SYNC")
            Log.d("SYNC_DATA", "========================================")
            Log.d("SYNC_DATA", "Endpoint: $API_ENDPOINT")
            Log.d("SYNC_DATA", "Method: GET")
            Log.d("SYNC_DATA", "----------------------------------------")

            val response = syncApi.sync()

            Log.d("SYNC_DATA", "← API RESPONSE RECEIVED")
            Log.d("SYNC_DATA", "Success: ${response.success}")

            if (response.success) {
                val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)

                // Sync Petugas
                Log.d("SYNC_DATA", "")
                Log.d("SYNC_DATA", "📥 Syncing Petugas...")
                Log.d("SYNC_DATA", "  Total: ${response.data.petugasJaga.size} records")
                database.petugasQueries.deleteAllPetugas()
                response.data.petugasJaga.forEach { petugas ->
                    database.petugasQueries.insertPetugas(
                        id = petugas.id,
                        nama = petugas.nama,
                        nik = petugas.nik,
                        noHp = petugas.noHp,
                        createdAt = petugas.createdAt,
                        updatedAt = petugas.updatedAt
                    )
                }
                Log.d("SYNC_DATA", "  ✅ Petugas synced successfully")

                // Sync Pos
                Log.d("SYNC_DATA", "")
                Log.d("SYNC_DATA", "📥 Syncing Pos...")
                Log.d("SYNC_DATA", "  Total: ${response.data.posJaga.size} records")
                database.posQueries.deleteAllPos()
                response.data.posJaga.forEach { pos ->
                    database.posQueries.insertPos(
                        id = pos.id,
                        nama = pos.nama,
                        lokasi = pos.lokasi,
                        createdAt = pos.createdAt,
                        updatedAt = pos.updatedAt
                    )
                }
                Log.d("SYNC_DATA", "  ✅ Pos synced successfully")

                // Sync QrCodes
                Log.d("SYNC_DATA", "")
                Log.d("SYNC_DATA", "📥 Syncing QR Codes...")
                Log.d("SYNC_DATA", "  Total: ${response.data.qrCodes.size} records")
                database.qrCodeQueries.deleteAllQrCodes()
                response.data.qrCodes.forEach { qr ->
                    database.qrCodeQueries.insertQrCode(
                        id = qr.id,
                        qrCode = qr.qrCode,
                        nama = qr.nama,
                        penanggungJawab = qr.penanggungJawab,
                        validFrom = qr.validFrom,
                        validUntil = qr.validUntil,
                        createdAt = qr.createdAt,
                        updatedAt = qr.updatedAt
                    )
                }
                Log.d("SYNC_DATA", "  ✅ QR Codes synced successfully")

                Log.d("SYNC_DATA", "")
                Log.d("SYNC_DATA", "========================================")
                Log.d("SYNC_DATA", "✅ MANUAL SYNC COMPLETE")
                Log.d("SYNC_DATA", "========================================")
                Log.d("SYNC_DATA", "Petugas: ${response.data.petugasJaga.size}")
                Log.d("SYNC_DATA", "Pos: ${response.data.posJaga.size}")
                Log.d("SYNC_DATA", "QR Codes: ${response.data.qrCodes.size}")
                Log.d("SYNC_DATA", "========================================")

                Result.success(Unit)
            } else {
                Log.e("SYNC_DATA", "❌ SYNC FAILED")
                Log.e("SYNC_DATA", "========================================")
                Result.failure(Exception("Sync failed"))
            }
        } catch (e: Exception) {
            Log.e("SYNC_DATA", "❌ SYNC EXCEPTION")
            Log.e("SYNC_DATA", "Exception: ${e.javaClass.simpleName}")
            Log.e("SYNC_DATA", "Message: ${e.message}")
            Log.e("SYNC_DATA", "Stack Trace: ${e.stackTraceToString()}")
            Log.e("SYNC_DATA", "========================================")
            Result.failure(e)
        }
    }

    fun getAllPetugas(): List<PetugasModel> {
        val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
        return database.petugasQueries.selectAllPetugas().executeAsList().map { it.toModel() }
    }

    fun getAllPos(): List<PosModel> {
        val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
        return database.posQueries.selectAllPos().executeAsList().map { it.toModel() }
    }

    fun getAllQrCodes(): List<QrCodeModel> {
        val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
        return database.qrCodeQueries.selectAllQrCodes().executeAsList().map { it.toModel() }
    }

    fun getQrCodeByCode(qrCode: String): QrCodeModel? {
        val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)

        // Log ALL QR codes for debugging
        val allQrCodes = database.qrCodeQueries.selectAllQrCodes().executeAsList()
        Log.d("All Data", "========== ALL QR CODES IN DATABASE ==========")
        Log.d("All Data", "Total QR Codes: ${allQrCodes.size}")
        allQrCodes.forEachIndexed { index, qr ->
            Log.d("All Data", """
                |QR [$index]:
                |  Database ID: ${qr.id}
                |  QR Code Value: ${qr.qrCode}
                |  Nama: ${qr.nama}
                |  Penanggung Jawab: ${qr.penanggungJawab}
                |  Valid From: ${qr.validFrom}
                |  Valid Until: ${qr.validUntil}
                |  Created At: ${qr.createdAt}
                |  Updated At: ${qr.updatedAt}
                |""".trimMargin())
        }
        Log.d("All Data", "================================================")

        // Log the QR code being searched (both for clarity)
        Log.d("All Data", "Searching for QR Code: $qrCode")
        Log.d("All Data", "  Checking against 'qrCode' field in database")

        val result = database.qrCodeQueries.selectQrCodeByCode(qrCode).executeAsOneOrNull()
        if (result != null) {
            Log.d("All Data", "✅ FOUND QR Code: $qrCode")
            Log.d("All Data", "  - Nama: ${result.nama}")
            Log.d("All Data", "  - Penanggung Jawab: ${result.penanggungJawab}")
        } else {
            Log.e("All Data", "❌ QR Code NOT FOUND: $qrCode")
        }

        return result?.toModel()
    }

    private fun com.hadirapp.pengamanan.db.Petugas.toModel(): PetugasModel {
        return PetugasModel(
            id = id,
            nama = nama,
            nik = nik,
            noHp = noHp,
            isActive = true,  // All synced records are active
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }

    private fun com.hadirapp.pengamanan.db.Pos.toModel(): PosModel {
        return PosModel(
            id = id,
            nama = nama,
            lokasi = lokasi,
            isActive = true,  // All synced records are active
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }

    private fun com.hadirapp.pengamanan.db.QrCode.toModel(): QrCodeModel {
        return QrCodeModel(
            id = id,
            qrCode = qrCode,
            nama = nama,
            penanggungJawab = penanggungJawab,
            validFrom = validFrom,
            validUntil = validUntil,
            isActive = true,  // All synced records are active
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}
