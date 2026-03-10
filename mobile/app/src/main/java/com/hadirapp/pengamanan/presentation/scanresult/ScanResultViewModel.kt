package com.hadirapp.pengamanan.presentation.scanresult

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.model.LogModel
import com.hadirapp.pengamanan.data.repository.LogRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ScanResultUiState(
    val isLoading: Boolean = true,
    val log: LogModel? = null,
    val error: String? = null
)

@HiltViewModel
class ScanResultViewModel @Inject constructor(
    private val logRepository: LogRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScanResultUiState())
    val uiState: StateFlow<ScanResultUiState> = _uiState.asStateFlow()

    fun loadScanResult(qrCode: String) {
        viewModelScope.launch {
            _uiState.value = ScanResultUiState(isLoading = true)

            try {
                // Get the most recent log with this QR code
                logRepository.getAllLogs().collect { logs ->
                    val recentLog = logs
                        .filter { it.qrCode == qrCode }
                        .maxByOrNull { it.scannedAt }

                    _uiState.value = ScanResultUiState(
                        isLoading = false,
                        log = recentLog
                    )
                }
            } catch (e: Exception) {
                _uiState.value = ScanResultUiState(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }
}
