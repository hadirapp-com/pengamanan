package com.hadirapp.pengamanan.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ScanRequest(
    val qrCode: String,
    val petugasJagaId: String,
    val posId: String,
    val tipeScan: String = "masuk"
)

@Serializable
data class ScanResponse(
    val success: Boolean,
    val message: String? = null,
    val error: String? = null,
    val data: ScanData? = null
)

@Serializable
data class ScanData(
    val scan: ScanLog,
    val qr: QRInfo,
    val petugas: String,
    val pos: String,
    val tipeScan: String
)

@Serializable
data class ScanLog(
    val id: String,
    val tipeScan: String,
    val scannedAt: String
)

@Serializable
data class QRInfo(
    val nama: String,
    val penanggungJawab: String
)
