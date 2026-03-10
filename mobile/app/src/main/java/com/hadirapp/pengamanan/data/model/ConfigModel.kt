package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ConfigResponse(
    val success: Boolean,
    val data: ConfigData?,
    val message: String? = null
)

@Serializable
data class ConfigData(
    val key: String,
    val value: String,
    val description: String?
)
