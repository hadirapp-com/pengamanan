package com.hadirapp.pengamanan.presentation.settings

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hadirapp.pengamanan.data.model.PetugasModel
import com.hadirapp.pengamanan.data.model.PosModel
import com.hadirapp.pengamanan.data.repository.AuthRepository
import com.hadirapp.pengamanan.data.repository.LogRepository
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
    val isLoggingOut: Boolean = false,
    val petugasList: List<PetugasModel> = emptyList(),
    val posList: List<PosModel> = emptyList(),
    val selectedPetugasId: String? = null,
    val selectedPetugasNama: String? = null,
    val selectedPosId: String? = null,
    val selectedPosNama: String? = null,
    val error: String? = null,
    val unsyncedLogsCount: Int = 0
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val syncRepository: SyncRepository,
    private val authRepository: AuthRepository,
    private val logRepository: LogRepository
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

            // Check unsynced logs count
            val unsyncedCount = logRepository.getUnsyncedLogsCount()

            _uiState.value = SettingsUiState(
                isLoading = false,
                petugasList = petugasList,
                posList = posList,
                selectedPetugasId = selectedPetugasId,
                selectedPetugasNama = selectedPetugasNama,
                selectedPosId = selectedPosId,
                selectedPosNama = selectedPosNama,
                unsyncedLogsCount = unsyncedCount
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

    fun logout(onLogoutComplete: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoggingOut = true)

            try {
                // Check if there are unsynced logs
                val unsyncedCount = logRepository.getUnsyncedLogsCount()

                if (unsyncedCount > 0) {
                    // Sync unsynced logs first
                    Log.d("SETTINGS", "Found $unsyncedCount unsynced logs, syncing before logout...")
                    val syncResult = logRepository.syncOfflineLogs()

                    syncResult.onFailure { e ->
                        Log.e("SETTINGS", "Failed to sync logs before logout: ${e.message}")
                        // Continue with logout even if sync fails
                    }
                }

                // Delete all data from database
                authRepository.deleteAllData()

                // Logout (clear preferences)
                authRepository.logout()

                _uiState.value = SettingsUiState() // Reset state
                onLogoutComplete()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoggingOut = false,
                    error = "Logout failed: ${e.message}"
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
