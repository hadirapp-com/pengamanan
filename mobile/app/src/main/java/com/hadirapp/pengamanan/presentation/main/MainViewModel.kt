package com.hadirapp.pengamanan.presentation.main

import androidx.lifecycle.ViewModel
import com.hadirapp.pengamanan.data.repository.AuthRepository
import com.hadirapp.pengamanan.presentation.navigation.Screen
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    fun determineStartDestination(): String {
        // Check if user has a valid (non-expired) token
        val hasValidToken = authRepository.getAccessToken() != null &&
                !authRepository.isTokenExpired()

        return if (hasValidToken) {
            // Token is valid, check if welcome popup was shown
            if (authRepository.isWelcomePopupShown()) {
                Screen.Home.route
            } else {
                Screen.Welcome.route
            }
        } else {
            // No valid token, show PIN screen
            Screen.Pin.route
        }
    }
}
