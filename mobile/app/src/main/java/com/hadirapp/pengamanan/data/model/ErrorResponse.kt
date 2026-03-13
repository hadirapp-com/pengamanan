package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ErrorResponse(
    val success: Boolean? = null,
    val error: String? = null,
    val message: String? = null,
    val details: List<ValidationError>? = null
)

@Serializable
data class ValidationError(
    val path: List<String>? = null,
    val message: String? = null,
    val code: String? = null
)
