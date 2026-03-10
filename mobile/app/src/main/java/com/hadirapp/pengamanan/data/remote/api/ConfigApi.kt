package com.hadirapp.pengamanan.data.remote.api

import com.hadirapp.pengamanan.data.model.ConfigResponse
import retrofit2.http.GET

interface ConfigApi {
    @GET("mobile/config")
    suspend fun getConfig(): ConfigResponse
}
