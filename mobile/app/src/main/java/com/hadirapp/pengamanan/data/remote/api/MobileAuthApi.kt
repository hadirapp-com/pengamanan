package com.hadirapp.pengamanan.data.remote.api

import com.hadirapp.pengamanan.data.model.PinRequest
import com.hadirapp.pengamanan.data.model.PinResponse
import com.hadirapp.pengamanan.data.model.ConfigResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface MobileAuthApi {
    @POST("mobile/auth/pin")
    suspend fun authenticateWithPin(@Body request: PinRequest): PinResponse

    @GET("mobile/config/{key}")
    suspend fun getConfig(@Path("key") key: String): ConfigResponse
}
