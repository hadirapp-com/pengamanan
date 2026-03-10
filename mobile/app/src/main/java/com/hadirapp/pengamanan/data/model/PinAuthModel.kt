package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PinRequest(
    val pin: String
)

@Serializable
data class PinResponse(
    val success: Boolean,
    val data: PinData?,
    @SerialName("message")
    val message: String? = null
)

@Serializable
data class PinData(
    val token: String,
    val expiresIn: Long,  // Token expiry in milliseconds
    val petugas: PetugasData
)

@Serializable
data class PetugasData(
    val id: String,
    val nama: String
)
