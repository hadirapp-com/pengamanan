package com.hadirapp.pengamanan.presentation.qrscanner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.repository.AuthRepository
import com.hadirapp.pengamanan.data.repository.LogRepository
import com.hadirapp.pengamanan.data.repository.SyncRepository
import com.hadirapp.pengamanan.data.model.QrCodeModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class QRScannerUiState(
    val isProcessing: Boolean = false,
    val hasRequiredInfo: Boolean = false,
    val petugasNama: String? = null,
    val posNama: String? = null,
    val error: String? = null,
    val qrData: QrCodeModel? = null,
    val showSuccessDialog: Boolean = false,
    val showErrorDialog: Boolean = false,
    val cameraEnabled: Boolean = true
)

@HiltViewModel
class QRScannerViewModel @Inject constructor(
    private val logRepository: LogRepository,
    private val authRepository: AuthRepository,
    private val syncRepository: SyncRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(QRScannerUiState())
    val uiState: StateFlow<QRScannerUiState> = _uiState.asStateFlow()

    var scanResult: String? = null
        private set

    // Debounce handling to prevent duplicate scans
    private var lastScannedQR: String? = null
    private var lastScanTime = 0L
    private val SCAN_DEBOUNCE_MS = 3000L // 3 seconds debounce

    init {
        checkRequiredInfo()
    }

    private fun checkRequiredInfo() {
        val petugasNama = authRepository.getSelectedPetugasNama()
        val posNama = authRepository.getSelectedPosNama()
        val hasRequiredInfo = petugasNama != null && posNama != null

        _uiState.value = _uiState.value.copy(
            hasRequiredInfo = hasRequiredInfo,
            petugasNama = petugasNama,
            posNama = posNama
        )
    }

    fun onQRCodeDetected(qrCode: String) {
        if (_uiState.value.isProcessing) return

        // Debounce: Ignore if same QR code scanned within debounce period
        val currentTime = System.currentTimeMillis()
        if (qrCode == lastScannedQR && currentTime - lastScanTime < SCAN_DEBOUNCE_MS) {
            return
        }

        // Check if we have required info
        val petugasId = authRepository.getSelectedPetugasId()
        val posId = authRepository.getSelectedPosId()

        if (petugasId == null || posId == null) {
            _uiState.value = _uiState.value.copy(
                error = "Petugas dan Pos Jaga harus dipilih terlebih dahulu",
                showErrorDialog = true,
                cameraEnabled = false
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isProcessing = true,
                error = null,
                qrData = null,
                showErrorDialog = false,
                showSuccessDialog = false
            )

            // Step 1: Validate QR code in local database first
            val localQrData = syncRepository.getQrCodeByCode(qrCode)

            if (localQrData == null) {
                // QR code not found in local database
                _uiState.value = _uiState.value.copy(
                    isProcessing = false,
                    error = "QR Code tidak terdaftar",
                    showErrorDialog = true,
                    cameraEnabled = false
                )
                return@launch
            }

            // Step 2: QR code found locally, now send to server
            val result = logRepository.scanQR(qrCode, petugasId, posId)

            _uiState.value = _uiState.value.copy(isProcessing = false, cameraEnabled = false)

            if (result.isSuccess) {
                // Update last scan info only on success
                lastScannedQR = qrCode
                lastScanTime = currentTime
                scanResult = qrCode
                _uiState.value = _uiState.value.copy(
                    qrData = localQrData,
                    showSuccessDialog = true
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    error = result.exceptionOrNull()?.message,
                    showErrorDialog = true
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun dismissSuccessDialog() {
        _uiState.value = _uiState.value.copy(showSuccessDialog = false)
    }

    fun dismissErrorDialog() {
        _uiState.value = _uiState.value.copy(showErrorDialog = false, error = null)
    }

    fun resetScan() {
        scanResult = null
        lastScannedQR = null
        lastScanTime = 0L
        _uiState.value = _uiState.value.copy(
            qrData = null,
            showSuccessDialog = false,
            showErrorDialog = false,
            error = null,
            cameraEnabled = true
        )
    }
}
