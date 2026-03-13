package com.hadirapp.pengamanan.data.remote.api

import com.hadirapp.pengamanan.data.model.ScanRequest
import com.hadirapp.pengamanan.data.model.ScanResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface ScanApi {
    @POST("mobile/scan")
    suspend fun scanQR(@Body request: ScanRequest): ScanResponse
}
