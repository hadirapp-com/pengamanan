package com.hadirapp.pengamanan.presentation.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import com.hadirapp.pengamanan.presentation.home.HomeScreen
import com.hadirapp.pengamanan.presentation.logs.LogsScreen
import com.hadirapp.pengamanan.presentation.pengumuman.PengumumanScreen
import com.hadirapp.pengamanan.presentation.pin.PinScreen
import com.hadirapp.pengamanan.presentation.qrscanner.QRScannerScreen
import com.hadirapp.pengamanan.presentation.scanresult.ScanResultScreen
import com.hadirapp.pengamanan.presentation.settings.SettingsScreen
import com.hadirapp.pengamanan.presentation.welcome.WelcomePopupScreen

sealed class Screen(
    val route: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector? = null,
    val label: String? = null
) {
    object Pin : Screen("pin")
    object Welcome : Screen("welcome")
    object Main : Screen("main") // Container for bottom nav screens
    object Home : Screen("home", Icons.Default.Home, "Beranda")
    object Settings : Screen("settings", Icons.Default.Settings, "Pengaturan")
    object QRScanner : Screen("qr_scanner")
    object ScanResult : Screen("scan_result/{qrCode}") {
        fun createRoute(qrCode: String) = "scan_result/$qrCode"
    }
    object Logs : Screen("logs", Icons.Default.History, "Riwayat")
    object Pengumuman : Screen("pengumuman", Icons.Default.Announcement, "Info")
}

// Bottom navigation screens
val bottomNavScreens = listOf(Screen.Home, Screen.Logs, Screen.Pengumuman, Screen.Settings)

@Composable
fun PengamananNavHost(
    navController: NavHostController = androidx.navigation.compose.rememberNavController(),
    startDestination: String = Screen.Pin.route
) {
    // Get current route to determine if we should show bottom nav
    val navBackStackEntry = navController.currentBackStackEntryAsState().value
    val currentRoute = navBackStackEntry?.destination?.route

    // Check if current route should show bottom nav
    val showBottomNav = currentRoute in bottomNavScreens.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomNav) {
                NavigationBar {
                    bottomNavScreens.forEach { screen ->
                        val selected = currentRoute == screen.route
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    imageVector = screen.icon!!,
                                    contentDescription = screen.label
                                )
                            },
                            label = { Text(screen.label!!) },
                            selected = selected,
                            onClick = {
                                if (!selected) {
                                    navController.navigate(screen.route) {
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(paddingValues)
        ) {
            // Auth screens - no bottom nav
            composable(Screen.Pin.route) {
                PinScreen(
                    onAuthSuccess = {
                        navController.navigate(Screen.Welcome.route) {
                            popUpTo(Screen.Pin.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Welcome.route) {
                WelcomePopupScreen(
                    onDismiss = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Welcome.route) { inclusive = true }
                        }
                    }
                )
            }

            // Bottom nav screens
            composable(Screen.Home.route) {
                HomeScreen(
                    onNavigateToQRScanner = {
                        navController.navigate(Screen.QRScanner.route)
                    },
                    onNavigateToLogs = {
                        navController.navigate(Screen.Logs.route) {
                            launchSingleTop = true
                        }
                    },
                    onNavigateToPengumuman = {
                        navController.navigate(Screen.Pengumuman.route) {
                            launchSingleTop = true
                        }
                    },
                    onNavigateToSettings = {
                        navController.navigate(Screen.Settings.route) {
                            launchSingleTop = true
                        }
                    }
                )
            }

            composable(Screen.Logs.route) {
                LogsScreen(
                    onNavigateBack = { /* No-op, handled by bottom nav */ }
                )
            }

            composable(Screen.Pengumuman.route) {
                PengumumanScreen(
                    onNavigateBack = { /* No-op, handled by bottom nav */ }
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    onNavigateBack = { /* No-op, handled by bottom nav */ }
                )
            }

            // Full screen screens - no bottom nav
            composable(Screen.QRScanner.route) {
                QRScannerScreen(
                    onNavigateBack = {
                        navController.popBackStack()
                    },
                    onScanSuccess = { qrCode ->
                        navController.navigate(Screen.ScanResult.createRoute(qrCode))
                    }
                )
            }

            composable(Screen.ScanResult.route) { backStackEntry ->
                val qrCode = backStackEntry.arguments?.getString("qrCode") ?: ""
                ScanResultScreen(
                    qrCode = qrCode,
                    onNavigateBack = {
                        navController.popBackStack()
                    },
                    onNavigateToLogs = {
                        navController.popBackStack(Screen.Home.route, false)
                        navController.navigate(Screen.Logs.route) {
                            launchSingleTop = true
                        }
                    }
                )
            }
        }
    }
}
