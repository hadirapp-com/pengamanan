package com.hadirapp.pengamanan.data.repository

import app.cash.sqldelight.db.SqlDriver
import com.hadirapp.pengamanan.data.remote.api.SyncApi
import com.hadirapp.pengamanan.data.model.PetugasModel
import com.hadirapp.pengamanan.data.model.PosModel
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
                        isActive = if (petugas.isActive) 1L else 0L,
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
                        isActive = if (pos.isActive) 1L else 0L,
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
                        isActive = if (qr.isActive) 1L else 0L,
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

    private fun com.hadirapp.pengamanan.db.Petugas.toModel(): PetugasModel {
        return PetugasModel(
            id = id,
            nama = nama,
            nik = nik,
            noHp = noHp,
            isActive = isActive == 1L,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }

    private fun com.hadirapp.pengamanan.db.Pos.toModel(): PosModel {
        return PosModel(
            id = id,
            nama = nama,
            lokasi = lokasi,
            isActive = isActive == 1L,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}
