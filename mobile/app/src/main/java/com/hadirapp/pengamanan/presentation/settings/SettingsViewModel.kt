package com.hadirapp.pengamanan.presentation.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.model.PetugasModel
import com.hadirapp.pengamanan.data.model.PosModel
import com.hadirapp.pengamanan.data.repository.AuthRepository
import com.hadirapp.pengamanan.data.repository.SyncRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val isLoading: Boolean = true,
    val isSyncing: Boolean = false,
    val petugasList: List<PetugasModel> = emptyList(),
    val posList: List<PosModel> = emptyList(),
    val selectedPetugasId: String? = null,
    val selectedPetugasNama: String? = null,
    val selectedPosId: String? = null,
    val selectedPosNama: String? = null,
    val error: String? = null
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val syncRepository: SyncRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            // Load selected petugas and pos
            val selectedPetugasId = authRepository.getSelectedPetugasId()
            val selectedPetugasNama = authRepository.getSelectedPetugasNama()
            val selectedPosId = authRepository.getSelectedPosId()
            val selectedPosNama = authRepository.getSelectedPosNama()

            // Load all petugas and pos from database
            val petugasList = syncRepository.getAllPetugas()
            val posList = syncRepository.getAllPos()

            _uiState.value = SettingsUiState(
                isLoading = false,
                petugasList = petugasList,
                posList = posList,
                selectedPetugasId = selectedPetugasId,
                selectedPetugasNama = selectedPetugasNama,
                selectedPosId = selectedPosId,
                selectedPosNama = selectedPosNama
            )
        }
    }

    fun syncData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSyncing = true)

            val result = syncRepository.syncData()
            result.onSuccess {
                // Reload data after sync
                loadData()
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isSyncing = false,
                    error = e.message
                )
            }
        }
    }

    fun selectPetugas(petugas: PetugasModel) {
        authRepository.saveSelectedPetugas(petugas.id, petugas.nama)
        _uiState.value = _uiState.value.copy(
            selectedPetugasId = petugas.id,
            selectedPetugasNama = petugas.nama
        )
    }

    fun selectPos(pos: PosModel) {
        authRepository.saveSelectedPos(pos.id, pos.nama, pos.lokasi)
        _uiState.value = _uiState.value.copy(
            selectedPosId = pos.id,
            selectedPosNama = pos.nama
        )
    }
}
