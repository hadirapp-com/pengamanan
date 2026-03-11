package com.hadirapp.pengamanan.presentation.qrscanner

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.shouldShowRationale
import com.hadirapp.pengamanan.presentation.qrscanner.DrawCorner

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun QRScannerScreen(
    viewModel: QRScannerViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit,
    onScanSuccess: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = androidx.compose.ui.platform.LocalContext.current

    // Camera permission
    val cameraPermissionState = rememberPermissionState(
        android.Manifest.permission.CAMERA
    )

    // Check for scan result
    LaunchedEffect(viewModel.scanResult) {
        viewModel.scanResult?.let { qrCode ->
            onScanSuccess(qrCode)
        }
    }

    // Handle errors
    LaunchedEffect(uiState.error) {
        uiState.error?.let { error ->
            viewModel.clearError()
            // Show snackbar or handle error
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scan QR Code") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize()) {
            when {
                // Permission denied
                !cameraPermissionState.status.isGranted -> {
                    PermissionContent(
                        onRequestPermission = { cameraPermissionState.launchPermissionRequest() },
                        onNavigateBack = onNavigateBack,
                        shouldShowRationale = cameraPermissionState.status.shouldShowRationale
                    )
                }

                // Missing petugas/pos
                !uiState.hasRequiredInfo -> {
                    MissingInfoContent(onNavigateBack = onNavigateBack)
                }

                // Show camera preview
                else -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues)
                    ) {
                        // Camera Preview
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f)
                        ) {
                            CameraPreview(
                                onQRCodeDetected = { qrCode ->
                                    viewModel.onQRCodeDetected(qrCode)
                                }
                            )

                            // QR Scanner overlay
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                // QR Frame corners
                                val cornerSize = 32.dp
                                val strokeWidth = 4.dp

                                Box(
                                    modifier = Modifier
                                        .size(250.dp)
                                ) {
                                    // Top left corner
                                    Box(
                                        modifier = Modifier
                                            .size(cornerSize)
                                            .drawCorner(
                                                color = Color.White,
                                                strokeWidth = strokeWidth,
                                                corner = DrawCorner.TopStart
                                            )
                                    )
                                    // Top right corner
                                    Box(
                                        modifier = Modifier
                                            .size(cornerSize)
                                            .align(Alignment.TopEnd)
                                            .drawCorner(
                                                color = Color.White,
                                                strokeWidth = strokeWidth,
                                                corner = DrawCorner.TopEnd
                                            )
                                    )
                                    // Bottom left corner
                                    Box(
                                        modifier = Modifier
                                            .size(cornerSize)
                                            .align(Alignment.BottomStart)
                                            .drawCorner(
                                                color = Color.White,
                                                strokeWidth = strokeWidth,
                                                corner = DrawCorner.BottomStart
                                            )
                                    )
                                    // Bottom right corner
                                    Box(
                                        modifier = Modifier
                                            .size(cornerSize)
                                            .align(Alignment.BottomEnd)
                                            .drawCorner(
                                                color = Color.White,
                                                strokeWidth = strokeWidth,
                                                corner = DrawCorner.BottomEnd
                                            )
                                    )
                                }
                            }
                        }

                        // Info Card
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "Scan QR Code",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Petugas: ${uiState.petugasNama ?: "-"}",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                Text(
                                    text = "Pos: ${uiState.posNama ?: "-"}",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                if (uiState.isProcessing) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Text(
                                            text = "Memproses...",
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PermissionContent(
    onRequestPermission: () -> Unit,
    onNavigateBack: () -> Unit,
    shouldShowRationale: Boolean
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.CameraAlt,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.outline
            )
            Text(
                text = "Izin Kamera Diperlukan",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = if (shouldShowRationale) {
                    "Izin kamera diperlukan untuk memindai QR Code. Silakan berikan izin untuk melanjutkan."
                } else {
                    "Aplikasi memerlukan izin kamera untuk memindai QR Code."
                },
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Button(
                onClick = onRequestPermission,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Berikan Izin Kamera")
            }
            OutlinedButton(
                onClick = onNavigateBack,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Kembali")
            }
        }
    }
}

@Composable
private fun MissingInfoContent(onNavigateBack: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.error
            )
            Text(
                text = "Informasi Belum Lengkap",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = "Silakan pilih Petugas dan Pos Jaga terlebih dahulu melalui Pengaturan",
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Button(
                onClick = onNavigateBack,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Kembali")
            }
        }
    }
}
