package com.hadirapp.pengamanan.data.repository

import app.cash.sqldelight.db.SqlDriver
import com.hadirapp.pengamanan.data.remote.api.SyncApi
import com.hadirapp.pengamanan.data.model.PetugasModel
import com.hadirapp.pengamanan.data.model.PosModel
import com.hadirapp.pengamanan.data.model.QrCodeModel
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncRepository @Inject constructor(
    private val syncApi: SyncApi,
    private val driver: SqlDriver
) {
    suspend fun syncData(): Result<Unit> {
        return try {
            val response = syncApi.sync()
            if (response.success) {
                val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)

                // Sync Petugas
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

                // Sync Pos
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

                // Sync QrCodes
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

                Result.success(Unit)
            } else {
                Result.failure(Exception("Sync failed"))
            }
        } catch (e: Exception) {
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
        return database.qrCodeQueries.selectQrCodeByCode(qrCode).executeAsOneOrNull()?.toModel()
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
