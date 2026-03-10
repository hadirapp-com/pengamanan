package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PetugasModel(
    val id: String,
    val nama: String,
    val nik: String,
    val noHp: String,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class PosModel(
    val id: String,
    val nama: String,
    val lokasi: String,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class QrCodeModel(
    val id: String,
    val qrCode: String,
    val nama: String,
    val penanggungJawab: String,
    val validFrom: String,
    val validUntil: String,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class SyncData(
    val petugasJaga: List<PetugasModel>,
    val posJaga: List<PosModel>,
    val qrCodes: List<QrCodeModel>,
    val pengumuman: List<PengumumanModel>,
    val syncedAt: String
)

@Serializable
data class SyncResponse(
    val success: Boolean,
    val data: SyncData
)
