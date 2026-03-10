package com.hadirapp.pengamanan.presentation.welcome

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
class WelcomeViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WelcomeUiState())
    val uiState: StateFlow<WelcomeUiState> = _uiState.asStateFlow()

    init {
        // Check if we have a cached popup image URL
        authRepository.getPopupImageUrl()?.let { cachedUrl ->
            _uiState.value = _uiState.value.copy(imageUrl = cachedUrl)
        }
    }

    fun fetchPopupImageUrl() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            // Fetch HOME_SCREEN_BANNER config from server
            val result = authRepository.fetchConfig("HOME_SCREEN_BANNER")

            result.onSuccess { imageUrl ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    imageUrl = imageUrl
                )
            }.onFailure {
                // If fetching fails, continue without image
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    fun markPopupAsShown() {
        authRepository.setWelcomePopupShown()
    }
}

data class WelcomeUiState(
    val isLoading: Boolean = false,
    val imageUrl: String? = null
)
