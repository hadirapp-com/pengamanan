package com.hadirapp.pengamanan.presentation.qrscanner

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme.colorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleEventObserver
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.callbackFlow
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@Composable
fun CameraPreview(
    onQRCodeDetected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
    val previewView = remember { PreviewView(context) }
    val executor = remember { Executors.newSingleThreadExecutor() }

    // QR Code Scanner
    val barcodeScanner = remember {
        val options = BarcodeScannerOptions.Builder()
            .setBarcodeFormats(
                com.google.mlkit.vision.barcode.Barcode.FORMAT_QR_CODE
            )
            .build()
        BarcodeScanning.getClient(options)
    }

    // Handle QR code detection
    LaunchedEffect(Unit) {
        barcodeScannerFlow(context, barcodeScanner, executor).collect { qrCode ->
            onQRCodeDetected(qrCode)
        }
    }

    // Permission check
    val cameraPermission = remember {
        ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                androidx.lifecycle.Lifecycle.Event.RESUME -> {
                    if (cameraPermission) {
                        startCamera(
                            context = context,
                            cameraProviderFuture = cameraProviderFuture,
                            previewView = previewView,
                            executor = executor,
                            barcodeScanner = barcodeScanner,
                            onQRCodeDetected = onQRCodeDetected
                        )
                    }
                }
                androidx.lifecycle.Lifecycle.Event.PAUSE -> {
                    // Camera will be stopped automatically
                }
                else -> {}
            }
        }

        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            executor.shutdown()
        }
    }

    if (cameraPermission) {
        AndroidView(
            factory = { previewView },
            modifier = modifier.fillMaxSize()
        )
    }
}

private fun startCamera(
    context: Context,
    cameraProviderFuture: ListenableFuture<ProcessCameraProvider>,
    previewView: PreviewView,
    executor: ExecutorService,
    barcodeScanner: com.google.mlkit.vision.barcode.BarcodeScanner,
    onQRCodeDetected: (String) -> Unit
) {
    val cameraProvider = cameraProviderFuture.get()

    val preview = Preview.Builder()
        .build()
        .also {
            it.setSurfaceProvider(previewView.surfaceProvider)
        }

    val imageAnalysis = ImageAnalysis.Builder()
        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
        .build()
        .also {
            it.setAnalyzer(executor) { imageProxy ->
                processImageProxy(imageProxy, barcodeScanner, onQRCodeDetected)
            }
        }

    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

    try {
        cameraProvider.unbindAll()
        cameraProvider.bindToLifecycle(
            androidx.lifecycle.ProcessCameraOwner.get(),
            cameraSelector,
            preview,
            imageAnalysis
        )
    } catch (exc: Exception) {
        exc.printStackTrace()
    }
}

private fun processImageProxy(
    imageProxy: ImageProxy,
    barcodeScanner: com.google.mlkit.vision.barcode.BarcodeScanner,
    onQRCodeDetected: (String) -> Unit
) {
    val mediaImage = imageProxy.image
    if (mediaImage != null) {
        val image = InputImage.fromMediaImage(
            mediaImage,
            imageProxy.imageInfo.rotationDegrees
        )

        barcodeScanner.process(image)
            .addOnSuccessListener { barcodes ->
                for (barcode in barcodes) {
                    barcode.rawValue?.let { qrCode ->
                        onQRCodeDetected(qrCode)
                    }
                }
            }
            .addOnFailureListener {
                it.printStackTrace()
            }
            .addOnCompleteListener {
                imageProxy.close()
            }
    } else {
        imageProxy.close()
    }
}

private fun barcodeScannerFlow(
    context: Context,
    barcodeScanner: com.google.mlkit.vision.barcode.BarcodeScanner,
    executor: ExecutorService
) = callbackFlow<String> {
    // This is a placeholder - actual detection happens in processImageProxy
    // The flow is needed for LaunchedEffect, but QR codes are detected
    // directly in the image analyzer
    awaitClose()
}
