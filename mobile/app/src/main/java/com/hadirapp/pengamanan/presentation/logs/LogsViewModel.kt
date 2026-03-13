package com.hadirapp.pengamanan.presentation.logs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.repository.LogRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LogsUiState(
    val isLoading: Boolean = true,
    val logs: List<com.hadirapp.pengamanan.data.model.LogModel> = emptyList(),
    val error: String? = null,
    val deleteError: String? = null
)

@HiltViewModel
class LogsViewModel @Inject constructor(
    private val logRepository: LogRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(LogsUiState())
    val uiState: StateFlow<LogsUiState> = _uiState.asStateFlow()

    init {
        loadLogs()
    }

    private fun loadLogs() {
        viewModelScope.launch {
            _uiState.value = LogsUiState(isLoading = true)

            try {
                logRepository.getAllLogs().collect { logs ->
                    _uiState.value = LogsUiState(
                        isLoading = false,
                        logs = logs
                    )
                }
            } catch (e: Exception) {
                _uiState.value = LogsUiState(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun refresh() {
        loadLogs()
    }

    fun deleteLog(logId: String) {
        viewModelScope.launch {
            val result = logRepository.deleteLog(logId)

            if (result.isFailure) {
                _uiState.value = _uiState.value.copy(
                    deleteError = result.exceptionOrNull()?.message
                )
            }
            // If success, the log will be automatically removed from the list
            // because we're using Flow
        }
    }

    fun clearDeleteError() {
        _uiState.value = _uiState.value.copy(deleteError = null)
    }
}
