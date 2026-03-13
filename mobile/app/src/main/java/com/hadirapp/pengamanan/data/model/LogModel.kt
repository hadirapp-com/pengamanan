package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LogModel(
    val id: String,
    val qrCode: String,
    val qrNama: String,
    val qrPenanggungJawab: String,
    val qrValidFrom: String,
    val qrValidUntil: String,
    val guestName: String,
    val guestType: String,
    val scanType: ScanType,
    val scannedAt: String,
    val petugasJaga: PetugasJagaInfo,
    val pos: PosInfo,
    val synced: Boolean = false
)

@Serializable
data class PetugasJagaInfo(
    val id: String,
    val nama: String
)

@Serializable
data class PosInfo(
    val id: String,
    val nama: String,
    val lokasi: String
)

@Serializable
enum class ScanType {
    MASUK,
    KELUAR
}

@Serializable
data class LogResponse(
    val success: Boolean,
    val data: LogData
)

@Serializable
data class LogData(
    val log: LogModel,
    val message: String
)
