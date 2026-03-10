package com.hadirapp.pengamanan.data.repository

import app.cash.sqldelight.db.SqlDriver
import com.hadirapp.pengamanan.data.model.LoginRequest
import com.hadirapp.pengamanan.data.model.LoginResponse
import com.hadirapp.pengamanan.data.model.PinRequest
import com.hadirapp.pengamanan.data.model.PinResponse
import com.hadirapp.pengamanan.data.remote.TokenProvider
import com.hadirapp.pengamanan.data.remote.api.AuthApi
import com.hadirapp.pengamanan.data.remote.api.MobileAuthApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val mobileAuthApi: MobileAuthApi,
    private val driver: SqlDriver,
    private val tokenProvider: TokenProvider
) {
    init {
        // Initialize token provider with this repository's getAccessToken function
        tokenProvider.init { getAccessToken() }
    }

    private val database get() = com.hadirapp.pengamanan.db.PengamananDatabase(driver)

    suspend fun login(username: String, password: String): Result<LoginResponse> {
        return try {
            val response = authApi.login(LoginRequest(username, password))
            if (response.success) {
                // Save tokens and user info
                saveAccessToken(response.data.accessToken)
                saveRefreshToken(response.data.refreshToken)
                saveUserInfo(response.data.user)
            }
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getAccessToken(): String? {
        return database.userPrefsQueries.getPref("access_token").executeAsOneOrNull()
    }

    fun getRefreshToken(): String? {
        return database.userPrefsQueries.getPref("refresh_token").executeAsOneOrNull()
    }

    private fun saveAccessToken(token: String) {
        database.userPrefsQueries.setPref("access_token", token)
    }

    private fun saveRefreshToken(token: String) {
        database.userPrefsQueries.setPref("refresh_token", token)
    }

    private fun saveUserInfo(user: com.hadirapp.pengamanan.data.model.UserModel) {
        database.userPrefsQueries.setPref("user_id", user.id)
        database.userPrefsQueries.setPref("user_username", user.username)
        database.userPrefsQueries.setPref("user_nama", user.nama)
        database.userPrefsQueries.setPref("user_role", user.role)
    }

    fun getUserId(): String? {
        return database.userPrefsQueries.getPref("user_id").executeAsOneOrNull()
    }

    fun getUserRole(): String? {
        return database.userPrefsQueries.getPref("user_role").executeAsOneOrNull()
    }

    fun isLoggedIn(): Boolean {
        return getAccessToken() != null
    }

    suspend fun logout() {
        database.userPrefsQueries.deletePref("access_token")
        database.userPrefsQueries.deletePref("refresh_token")
        database.userPrefsQueries.deletePref("user_id")
        database.userPrefsQueries.deletePref("user_username")
        database.userPrefsQueries.deletePref("user_nama")
        database.userPrefsQueries.deletePref("user_role")
    }

    // PIN Authentication for Mobile
    suspend fun authenticateWithPin(pin: String): Result<PinResponse> {
        return try {
            val response = mobileAuthApi.authenticateWithPin(PinRequest(pin))
            if (response.success && response.data != null) {
                // Save token from response
                saveAccessToken(response.data.token)

                // Calculate token expiry time (current time + expiresIn from server)
                val expiryMillis = System.currentTimeMillis() + response.data.expiresIn
                saveTokenExpiryTime(expiryMillis)

                // Save petugas info
                savePetugasInfo(response.data.petugas.id, response.data.petugas.nama)

                // Fetch HOME_SCREEN_BANNER config (non-blocking)
                fetchConfig("HOME_SCREEN_BANNER")
            }
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun savePetugasInfo(id: String, nama: String) {
        database.userPrefsQueries.setPref("petugas_id", id)
        database.userPrefsQueries.setPref("petugas_nama", nama)
    }

    fun getPetugasId(): String? {
        return database.userPrefsQueries.getPref("petugas_id").executeAsOneOrNull()
    }

    fun getPetugasNama(): String? {
        return database.userPrefsQueries.getPref("petugas_nama").executeAsOneOrNull()
    }

    fun saveSelectedPetugas(id: String, nama: String) {
        database.userPrefsQueries.setPref("selected_petugas_id", id)
        database.userPrefsQueries.setPref("selected_petugas_nama", nama)
    }

    fun getSelectedPetugasId(): String? {
        return database.userPrefsQueries.getPref("selected_petugas_id").executeAsOneOrNull()
    }

    fun getSelectedPetugasNama(): String? {
        return database.userPrefsQueries.getPref("selected_petugas_nama").executeAsOneOrNull()
    }

    fun saveSelectedPos(id: String, nama: String) {
        database.userPrefsQueries.setPref("selected_pos_id", id)
        database.userPrefsQueries.setPref("selected_pos_nama", nama)
    }

    fun getSelectedPosId(): String? {
        return database.userPrefsQueries.getPref("selected_pos_id").executeAsOneOrNull()
    }

    fun getSelectedPosNama(): String? {
        return database.userPrefsQueries.getPref("selected_pos_nama").executeAsOneOrNull()
    }

    private fun saveTokenExpiryTime(timestamp: Long) {
        database.userPrefsQueries.setPref("token_expiry_time", timestamp.toString())
    }

    fun getTokenExpiryTime(): Long? {
        return database.userPrefsQueries.getPref("token_expiry_time")
            .executeAsOneOrNull()?.toLongOrNull()
    }

    fun isTokenExpired(): Boolean {
        val expiryTime = getTokenExpiryTime() ?: return true
        return System.currentTimeMillis() >= expiryTime
    }

    // Welcome Popup Management
    fun setWelcomePopupShown() {
        database.userPrefsQueries.setPref("welcome_popup_shown", "true")
    }

    fun isWelcomePopupShown(): Boolean {
        return database.userPrefsQueries.getPref("welcome_popup_shown")
            .executeAsOneOrNull() == "true"
    }

    fun savePopupImageUrl(url: String) {
        database.userPrefsQueries.setPref("popup_image_url", url)
    }

    fun getPopupImageUrl(): String? {
        return database.userPrefsQueries.getPref("popup_image_url").executeAsOneOrNull()
    }

    /**
     * Fetch config value from server by key
     * Used for fetching configs like HOME_SCREEN_BANNER
     */
    suspend fun fetchConfig(key: String): Result<String> {
        return try {
            val response = mobileAuthApi.getConfig(key)
            if (response.success && response.data != null) {
                val configValue = response.data.value
                // Cache the config value if it's HOME_SCREEN_BANNER
                if (key == "HOME_SCREEN_BANNER") {
                    savePopupImageUrl(configValue)
                }
                Result.success(configValue)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch config"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
