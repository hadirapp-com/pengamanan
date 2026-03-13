package com.hadirapp.pengamanan.di

import com.hadirapp.pengamanan.data.repository.AuthRepository
import com.hadirapp.pengamanan.data.repository.LogRepository
import com.hadirapp.pengamanan.data.repository.SyncRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(authRepository: AuthRepository): AuthRepository

    @Binds
    @Singleton
    abstract fun bindLogRepository(logRepository: LogRepository): LogRepository

    @Binds
    @Singleton
    abstract fun bindSyncRepository(syncRepository: SyncRepository): SyncRepository
}
