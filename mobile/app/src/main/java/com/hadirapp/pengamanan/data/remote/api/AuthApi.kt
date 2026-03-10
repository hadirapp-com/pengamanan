package com.hadirapp.pengamanan.data.remote.api

import com.hadirapp.pengamanan.data.model.LoginRequest
import com.hadirapp.pengamanan.data.model.LoginResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
}
