package com.hadirapp.pengamanan.data.remote

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenProvider @Inject constructor() {
    private var getAccessToken: (() -> String?)? = null

    fun init(provider: () -> String?) {
        getAccessToken = provider
    }

    fun getToken(): String? = getAccessToken?.invoke()
}
