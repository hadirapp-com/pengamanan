package com.hadirapp.pengamanan.data.remote.api

import com.hadirapp.pengamanan.data.model.LogModel
import com.hadirapp.pengamanan.data.model.LogResponse
import com.hadirapp.pengamanan.data.model.ScanRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface LogApi {
    @POST("logs/scan")
    suspend fun scanQR(@Body request: ScanRequest): LogResponse

    @GET("logs")
    suspend fun getLogs(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("posId") posId: String? = null,
        @Query("startDate") startDate: String? = null,
        @Query("endDate") endDate: String? = null
    ): LogsResponse
}

@kotlinx.serialization.Serializable
data class LogsResponse(
    val success: Boolean,
    val data: LogsData
)

@kotlinx.serialization.Serializable
data class LogsData(
    val logs: List<LogModel>,
    val total: Int,
    val page: Int,
    val limit: Int
)
