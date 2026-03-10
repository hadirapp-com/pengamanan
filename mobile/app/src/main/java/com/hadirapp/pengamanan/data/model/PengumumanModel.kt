package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PengumumanModel(
    val id: String,
    val judul: String,
    val isi: String,
    val prioritas: Priority,
    val createdAt: String,
    val createdBy: String
)

@Serializable
enum class Priority {
    NORMAL,
    PENTING,
    URGENT
}

@Serializable
data class PengumumanListResponse(
    val success: Boolean,
    val data: List<PengumumanModel>
)
