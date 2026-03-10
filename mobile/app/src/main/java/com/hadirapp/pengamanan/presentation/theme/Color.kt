package com.hadirapp.pengamanan.presentation.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color

// Brand Colors - Hadirapp Blue Theme
val Blue80 = Color(0xFF4267B2)
val BlueGrey80 = Color(0xFF37474F)
val BlueGrey40 = Color(0xFF78909C)

private val Blue40 = Color(0xFF4267B2)
private val BlueGrey30 = Color(0xFF546E7A)

val PengamananBlue = Color(0xFF2563EB)
val PengamananBlueDark = Color(0xFF1E40AF)
val PengamananBlueLight = Color(0xFF3B82F6)

// Custom Colors
val MasukGreen = Color(0xFF10B981)
val KeluarRed = Color(0xFFEF4444)

val LightColorScheme = lightColorScheme(
    primary = PengamananBlue,
    onPrimary = Color.White,
    primaryContainer = PengamananBlueLight,
    onPrimaryContainer = Color.White,
    secondary = Blue40,
    onSecondary = Color.White,
    tertiary = BlueGrey30,
    onTertiary = Color.White,
    error = KeluarRed,
    onError = Color.White,
    background = Color(0xFFFFFBFE),
    onBackground = Color(0xFF1C1B1F),
    surface = Color(0xFFFFFBFE),
    onSurface = Color(0xFF1C1B1F),
)

val DarkColorScheme = darkColorScheme(
    primary = Blue80,
    onPrimary = Color.White,
    primaryContainer = BlueGrey30,
    onPrimaryContainer = BlueGrey80,
    secondary = BlueGrey80,
    onSecondary = Color.White,
    tertiary = BlueGrey40,
    onTertiary = Color.White,
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    background = Color(0xFF1C1B1F),
    onBackground = Color(0xFFE2E2E6),
    surface = Color(0xFF1C1B1F),
    onSurface = Color(0xFFE2E2E6),
)
