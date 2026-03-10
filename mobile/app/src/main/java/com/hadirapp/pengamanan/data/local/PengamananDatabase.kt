package com.hadirapp.pengamanan.data.local

import android.content.Context
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import com.hadirapp.pengamanan.db.PengamananDatabase

class DatabaseDriverFactory(private val context: Context) {
    fun createDriver(): SqlDriver {
        return AndroidSqliteDriver(
            schema = PengamananDatabase.Schema,
            context = context,
            name = "pengamanan.db"
        )
    }
}
