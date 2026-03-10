package com.hadirapp.pengamanan.data.repository

import com.hadirapp.pengamanan.data.model.ConfigResponse
import com.hadirapp.pengamanan.data.remote.api.ConfigApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ConfigRepository @Inject constructor(
    private val configApi: ConfigApi
) {
    suspend fun getConfig(): Result<ConfigResponse> {
        return try {
            val response = configApi.getConfig()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
