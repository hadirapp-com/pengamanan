package com.hadirapp.pengamanan.di

import android.content.Context
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideSqlDriver(@ApplicationContext context: Context): SqlDriver {
        val dbName = "pengamanan.db"
        val schema = com.hadirapp.pengamanan.db.PengamananDatabase.Schema

        // Check if database exists and recreate if schema is incompatible
        val dbFile = context.getDatabasePath(dbName)
        if (dbFile.exists()) {
            try {
                // Try to create driver with existing database
                val testDriver = AndroidSqliteDriver(schema, context, name = dbName)
                // Test if we can query the database
                testDriver.executeQuery(null, "SELECT COUNT(*) FROM pengumuman", { cursor ->
                    cursor.next()
                }, 0)
                testDriver.close()
            } catch (e: Exception) {
                // Database schema is incompatible, delete and recreate
                context.deleteDatabase(dbName)
            }
        }

        return AndroidSqliteDriver(
            schema = schema,
            context = context,
            name = dbName
        )
    }
}
