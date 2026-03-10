package com.hadirapp.pengamanan.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.hadirapp.pengamanan.presentation.home.HomeScreen
import com.hadirapp.pengamanan.presentation.qrscanner.QRScannerScreen
import com.hadirapp.pengamanan.presentation.scanresult.ScanResultScreen
import com.hadirapp.pengamanan.presentation.logs.LogsScreen
import com.hadirapp.pengamanan.presentation.pengumuman.PengumumanScreen

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object QRScanner : Screen("qr_scanner")
    object ScanResult : Screen("scan_result/{qrCode}") {
        fun createRoute(qrCode: String) = "scan_result/$qrCode"
    }
    object Logs : Screen("logs")
    object Pengumuman : Screen("pengumuman")
}

@Composable
fun PengamananNavHost(
    navController: NavHostController = androidx.navigation.compose.rememberNavController(),
    startDestination: String = Screen.Home.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToQRScanner = {
                    navController.navigate(Screen.QRScanner.route)
                },
                onNavigateToLogs = {
                    navController.navigate(Screen.Logs.route)
                },
                onNavigateToPengumuman = {
                    navController.navigate(Screen.Pengumuman.route)
                }
            )
        }

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
                    navController.navigate(Screen.Logs.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                    }
                }
            )
        }

        composable(Screen.Logs.route) {
            LogsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.Pengumuman.route) {
            PengumumanScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}
