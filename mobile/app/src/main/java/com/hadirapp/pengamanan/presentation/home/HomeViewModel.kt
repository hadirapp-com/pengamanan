package com.hadirapp.pengamanan.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.repository.AuthRepository
import com.hadirapp.pengamanan.data.repository.PengumumanRepository
import com.hadirapp.pengamanan.data.repository.SyncRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = true,
    val isSyncing: Boolean = false,
    val pengumuman: List<com.hadirapp.pengamanan.data.model.PengumumanModel> = emptyList(),
    val selectedPetugasNama: String? = null,
    val selectedPosNama: String? = null,
    val lastSyncTime: String? = null,
    val hasPetugasAndPos: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val pengumumanRepository: PengumumanRepository,
    private val syncRepository: SyncRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            // Auto-sync if no petugas/pos data locally
            val localPetugas = syncRepository.getAllPetugas()
            val localPos = syncRepository.getAllPos()

            if (localPetugas.isEmpty() || localPos.isEmpty()) {
                _uiState.value = _uiState.value.copy(isSyncing = true)
                syncRepository.syncData()
                _uiState.value = _uiState.value.copy(isSyncing = false)
            }

            // Check if petugas and pos are selected
            val selectedPetugasNama = authRepository.getSelectedPetugasNama()
            val selectedPosNama = authRepository.getSelectedPosNama()
            val hasPetugasAndPos = selectedPetugasNama != null && selectedPosNama != null

            // Load pengumuman
            try {
                pengumumanRepository.refreshPengumuman()
                pengumumanRepository.getAllPengumuman().collect { pengumuman ->
                    _uiState.value = HomeUiState(
                        isLoading = false,
                        pengumuman = pengumuman,
                        selectedPetugasNama = selectedPetugasNama,
                        selectedPosNama = selectedPosNama,
                        hasPetugasAndPos = hasPetugasAndPos
                    )
                }
            } catch (e: Exception) {
                _uiState.value = HomeUiState(
                    isLoading = false,
                    selectedPetugasNama = selectedPetugasNama,
                    selectedPosNama = selectedPosNama,
                    hasPetugasAndPos = hasPetugasAndPos,
                    error = e.message
                )
            }
        }
    }

    fun syncData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSyncing = true)

            val result = syncRepository.syncData()
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isSyncing = false)
                loadData() // Reload after sync
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isSyncing = false,
                    error = e.message
                )
            }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            // Check if petugas and pos are selected (updated after settings change)
            val selectedPetugasNama = authRepository.getSelectedPetugasNama()
            val selectedPosNama = authRepository.getSelectedPosNama()
            val hasPetugasAndPos = selectedPetugasNama != null && selectedPosNama != null

            // Update UI state without syncing
            _uiState.value = _uiState.value.copy(
                selectedPetugasNama = selectedPetugasNama,
                selectedPosNama = selectedPosNama,
                hasPetugasAndPos = hasPetugasAndPos
            )
        }
    }
}
