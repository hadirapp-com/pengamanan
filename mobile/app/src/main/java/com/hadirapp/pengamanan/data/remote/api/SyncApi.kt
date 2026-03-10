package com.hadirapp.pengamanan.data.remote.api

import com.hadirapp.pengamanan.data.model.SyncResponse
import retrofit2.http.GET

interface SyncApi {
    @GET("mobile/sync")
    suspend fun sync(): SyncResponse
}
