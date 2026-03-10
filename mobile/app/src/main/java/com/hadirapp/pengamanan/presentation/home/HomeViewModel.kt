package com.hadirapp.pengamanan.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.repository.PengumumanRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = true,
    val pengumuman: List<com.hadirapp.pengamanan.data.model.PengumumanModel> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val pengumumanRepository: PengumumanRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadPengumuman()
    }

    private fun loadPengumuman() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                pengumumanRepository.refreshPengumuman()
                pengumumanRepository.getAllPengumuman().collect { pengumuman ->
                    _uiState.value = HomeUiState(
                        isLoading = false,
                        pengumuman = pengumuman
                    )
                }
            } catch (e: Exception) {
                _uiState.value = HomeUiState(
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
