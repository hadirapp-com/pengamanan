package com.hadirapp.pengamanan.presentation.pin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PinViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PinUiState())
    val uiState: StateFlow<PinUiState> = _uiState.asStateFlow()

    fun onPinChange(pin: String) {
        _uiState.value = _uiState.value.copy(
            pin = pin.take(6), // Limit to 6 digits
            error = null
        )
    }

    fun authenticateWithPin() {
        val pin = _uiState.value.pin
        if (pin.length != 6) {
            _uiState.value = _uiState.value.copy(
                error = "PIN harus 6 digit"
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = authRepository.authenticateWithPin(pin)

            result.onSuccess { response ->
                if (response.success) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = true,
                        error = null
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = response.message ?: "PIN tidak valid"
                    )
                }
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Terjadi kesalahan. Coba lagi."
                )
            }
        }
    }
}

data class PinUiState(
    val pin: String = "",
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val error: String? = null
)
