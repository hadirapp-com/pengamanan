package com.hadirapp.pengamanan.data.repository

import app.cash.sqldelight.db.SqlDriver
import com.hadirapp.pengamanan.data.model.PengumumanModel
import com.hadirapp.pengamanan.data.remote.api.PengumumanApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PengumumanRepository @Inject constructor(
    private val pengumumanApi: PengumumanApi,
    private val driver: SqlDriver
) {
    suspend fun refreshPengumuman(): Result<Unit> {
        return try {
            val response = pengumumanApi.getPengumuman()
            if (response.success) {
                val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
                // Clear and insert new data
                database.pengumumanQueries.deleteAllPengumuman()
                response.data.forEach { pengumuman ->
                    database.pengumumanQueries.insertPengumuman(
                        id = pengumuman.id,
                        title = pengumuman.title,
                        content = pengumuman.content,
                        priority = pengumuman.priority,
                        createdAt = pengumuman.createdAt,
                        updatedAt = pengumuman.updatedAt
                    )
                }
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to fetch pengumuman"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getAllPengumuman(): Flow<List<PengumumanModel>> = flow {
        val database = com.hadirapp.pengamanan.db.PengamananDatabase(driver)
        emit(database.pengumumanQueries.selectAllPengumuman().executeAsList().map { it.toModel() })
    }

    private fun com.hadirapp.pengamanan.db.Pengumuman.toModel(): PengumumanModel {
        return PengumumanModel(
            id = id,
            title = title,
            content = content,
            priority = priority,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}
