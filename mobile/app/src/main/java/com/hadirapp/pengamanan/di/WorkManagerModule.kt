package com.hadirapp.pengamanan.di

import android.content.Context
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.WorkerParameters
import com.hadirapp.pengamanan.data.worker.SyncWorker
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class WorkManagerModule {

    @Binds
    abstract fun bindHiltWorkerFactory(factory: HiltWorkerFactory): HiltWorkerFactory.Factory

    companion object {
        @Provides
        @Singleton
        fun provideSyncManager(
            @ApplicationContext context: Context
        ): com.hadirapp.pengamanan.data.worker.SyncManager {
            return com.hadirapp.pengamanan.data.worker.SyncManager(context)
        }
    }
}

