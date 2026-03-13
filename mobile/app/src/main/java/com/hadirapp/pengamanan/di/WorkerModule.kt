package com.hadirapp.pengamanan.di

import com.hadirapp.pengamanan.data.work.SyncWorker
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(ViewModelComponent::class)
abstract class WorkerModule {
    // Worker bindings jika diperlukan
    // Currently using @HiltWorker which auto-generates factory
}
