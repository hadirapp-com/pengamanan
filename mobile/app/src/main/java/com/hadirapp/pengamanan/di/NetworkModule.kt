package com.hadirapp.pengamanan.di

import com.hadirapp.pengamanan.data.remote.api.AuthApi
import com.hadirapp.pengamanan.data.remote.api.MobileAuthApi
import com.hadirapp.pengamanan.data.remote.api.MobileApi
import com.hadirapp.pengamanan.data.remote.api.ScanApi
import com.hadirapp.pengamanan.data.remote.TokenProvider
import com.hadirapp.pengamanan.data.remote.impl.TokenProviderImpl
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.create
import java.util.concurrent.TimeUnit
import javax.inject.Singleton
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE_URL = "https://blokf.hadirapp.com/api/"

    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = if (com.hadirapp.pengamanan.BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        loggingInterceptor: HttpLoggingInterceptor,
        tokenProvider: TokenProvider
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor { chain ->
                val request = chain.request()
                val token = tokenProvider.getAccessToken()
                val newRequest = if (token != null) {
                    request.newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .build()
                } else {
                    request
                }
                chain.proceed(newRequest)
            }
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient, json: Json): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(
                json.asConverterFactory(
                    "application/json".toMediaType()
                )
            )
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi {
        return retrofit.create()
    }

    @Provides
    @Singleton
    fun provideMobileAuthApi(retrofit: Retrofit): MobileAuthApi {
        return retrofit.create()
    }

    @Provides
    @Singleton
    fun provideMobileApi(retrofit: Retrofit): MobileApi {
        return retrofit.create()
    }

    @Provides
    @Singleton
    fun provideScanApi(retrofit: Retrofit): ScanApi {
        return retrofit.create()
    }

    @Provides
    @Singleton
    fun provideTokenProvider(): TokenProvider {
        return TokenProviderImpl()
    }
}
