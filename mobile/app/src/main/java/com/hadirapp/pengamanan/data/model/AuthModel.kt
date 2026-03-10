package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val username: String,
    val password: String
)

@Serializable
data class LoginResponse(
    val success: Boolean,
    val data: AuthData
)

@Serializable
data class AuthData(
    val accessToken: String,
    val refreshToken: String,
    val user: UserModel
)

@Serializable
data class UserModel(
    val id: String,
    val username: String,
    val nama: String,
    val role: String
)
