package com.hadirapp.pengamanan.presentation.qrscanner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.repository.LogRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class QRScannerUiState(
    val isProcessing: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class QRScannerViewModel @Inject constructor(
    private val logRepository: LogRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(QRScannerUiState())
    val uiState: StateFlow<QRScannerUiState> = _uiState.asStateFlow()

    var scanResult: String? = null
        private set

    fun onQRCodeDetected(qrCode: String) {
        if (_uiState.value.isProcessing) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessing = true)

            // TODO: Get petugasJagaId and posId from auth/preferences
            val petugasJagaId = "petugas_1"
            val posId = "pos_1"

            val result = logRepository.scanQR(qrCode, petugasJagaId, posId)

            _uiState.value = _uiState.value.copy(isProcessing = false)

            if (result.isSuccess) {
                scanResult = qrCode
            } else {
                _uiState.value = _uiState.value.copy(
                    error = result.exceptionOrNull()?.message
                )
            }
        }
    }

    fun resetScan() {
        scanResult = null
    }
}
