package com.hadirapp.pengamanan.data.repository

import app.cash.sqldelight.db.SqlDriver
import com.hadirapp.pengamanan.data.model.LoginRequest
import com.hadirapp.pengamanan.data.model.LoginResponse
import com.hadirapp.pengamanan.data.remote.api.AuthApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val driver: SqlDriver
) {
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
}
