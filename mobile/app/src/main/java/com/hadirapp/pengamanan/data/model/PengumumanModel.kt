package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PengumumanModel(
    val id: String,
    val title: String,
    val content: String,
    val priority: String,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class PengumumanListResponse(
    val success: Boolean,
    val data: List<PengumumanModel>
)
