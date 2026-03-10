package com.hadirapp.pengamanan.presentation.scanresult

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.hadirapp.pengamanan.data.model.ScanType

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanResultScreen(
    qrCode: String,
    viewModel: ScanResultViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit,
    onNavigateToLogs: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(qrCode) {
        viewModel.loadScanResult(qrCode)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Hasil Scan") },
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
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (uiState.error != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Error,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.error
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = uiState.error ?: "Terjadi kesalahan",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.error
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(onClick = onNavigateBack) {
                        Text("Kembali")
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Success Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = when (uiState.log?.scanType) {
                            ScanType.MASUK -> MaterialTheme.colorScheme.primaryContainer
                            ScanType.KELUAR -> MaterialTheme.colorScheme.errorContainer
                            null -> MaterialTheme.colorScheme.surface
                        }
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = when (uiState.log?.scanType) {
                                ScanType.MASUK -> Icons.Default.Login
                                ScanType.KELUAR -> Icons.Default.Logout
                                null -> Icons.Default.CheckCircle
                            },
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = when (uiState.log?.scanType) {
                                ScanType.MASUK -> com.hadirapp.pengamanan.presentation.theme.MasukGreen
                                ScanType.KELUAR -> com.hadirapp.pengamanan.presentation.theme.KeluarRed
                                null -> MaterialTheme.colorScheme.primary
                            }
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Scan Berhasil!",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = when (uiState.log?.scanType) {
                                ScanType.MASUK -> "Tamu Masuk"
                                ScanType.KELUAR -> "Tamu Keluar"
                                null -> "Scan Terdeteksi"
                            },
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                }

                // Details Card
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Detail Scan",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )

                        DetailRow(
                            icon = Icons.Default.QrCode,
                            label = "QR Code",
                            value = uiState.log?.qrCode ?: qrCode
                        )

                        DetailRow(
                            icon = Icons.Default.Person,
                            label = "Nama Tamu",
                            value = uiState.log?.guestName ?: "Unknown"
                        )

                        DetailRow(
                            icon = Icons.Default.Badge,
                            label = "Tipe Tamu",
                            value = uiState.log?.guestType ?: "GUEST"
                        )

                        DetailRow(
                            icon = Icons.Default.Shield,
                            label = "Petugas Jaga",
                            value = uiState.log?.petugasJaga?.nama ?: "Unknown"
                        )

                        DetailRow(
                            icon = Icons.Default.LocationOn,
                            label = "Pos",
                            value = uiState.log?.pos?.nama ?: "Unknown"
                        )

                        DetailRow(
                            icon = Icons.Default.AccessTime,
                            label = "Waktu Scan",
                            value = uiState.log?.scannedAt ?: "Unknown"
                        )

                        if (uiState.log?.synced == false) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CloudOff,
                                    contentDescription = null,
                                    modifier = Modifier.size(20.dp),
                                    tint = MaterialTheme.colorScheme.outline
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "Belum disinkronkan (offline)",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.outline
                                )
                            }
                        }
                    }
                }

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateBack
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Kembali")
                    }

                    Button(
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToLogs
                    ) {
                        Icon(
                            imageVector = Icons.Default.History,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Riwayat")
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(20.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.outline
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}
