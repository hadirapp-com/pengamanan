package com.hadirapp.pengamanan.presentation.qrscanner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.repository.AuthRepository
import com.hadirapp.pengamanan.data.repository.LogRepository
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
    val error: String? = null
)

@HiltViewModel
class QRScannerViewModel @Inject constructor(
    private val logRepository: LogRepository,
    private val authRepository: AuthRepository
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
                error = "Petugas dan Pos Jaga harus dipilih terlebih dahulu"
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessing = true, error = null)

            val result = logRepository.scanQR(qrCode, petugasId, posId)

            _uiState.value = _uiState.value.copy(isProcessing = false)

            if (result.isSuccess) {
                // Update last scan info only on success
                lastScannedQR = qrCode
                lastScanTime = currentTime
                scanResult = qrCode
            } else {
                _uiState.value = _uiState.value.copy(
                    error = result.exceptionOrNull()?.message
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun resetScan() {
        scanResult = null
        lastScannedQR = null
        lastScanTime = 0L
    }
}
