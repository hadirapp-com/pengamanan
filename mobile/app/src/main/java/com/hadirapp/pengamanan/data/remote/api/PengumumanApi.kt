package com.hadirapp.pengamanan.data.remote.api

import com.hadirapp.pengamanan.data.model.PengumumanListResponse
import retrofit2.http.GET

interface PengumumanApi {
    @GET("mobile/pengumuman")
    suspend fun getPengumuman(): PengumumanListResponse
}
