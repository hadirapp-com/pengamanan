package com.hadirapp.pengamanan.presentation.pengumuman

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.repository.PengumumanRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PengumumanUiState(
    val isLoading: Boolean = true,
    val pengumuman: List<com.hadirapp.pengamanan.data.model.PengumumanModel> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class PengumumanViewModel @Inject constructor(
    private val pengumumanRepository: PengumumanRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PengumumanUiState())
    val uiState: StateFlow<PengumumanUiState> = _uiState.asStateFlow()

    init {
        loadPengumuman()
    }

    private fun loadPengumuman() {
        viewModelScope.launch {
            _uiState.value = PengumumanUiState(isLoading = true)

            try {
                // Refresh from API first
                pengumumanRepository.refreshPengumuman()

                // Then load from local database
                pengumumanRepository.getAllPengumuman().collect { pengumuman ->
                    _uiState.value = PengumumanUiState(
                        isLoading = false,
                        pengumuman = pengumuman
                    )
                }
            } catch (e: Exception) {
                _uiState.value = PengumumanUiState(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun refresh() {
        loadPengumuman()
    }
}
