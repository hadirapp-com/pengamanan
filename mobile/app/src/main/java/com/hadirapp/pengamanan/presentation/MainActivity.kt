package com.hadirapp.pengamanan.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import com.hadirapp.pengamanan.presentation.main.MainViewModel
import com.hadirapp.pengamanan.presentation.navigation.PengamananNavHost
import com.hadirapp.pengamanan.presentation.navigation.Screen
import com.hadirapp.pengamanan.presentation.theme.PengamananTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PengamananTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }
}

@Composable
fun AppNavigation(
    mainViewModel: MainViewModel = hiltViewModel()
) {
    var startDestination by rememberSaveable { mutableStateOf<String>(Screen.Pin.route) }
    var hasCheckedAuth by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        if (!hasCheckedAuth) {
            startDestination = mainViewModel.determineStartDestination()
            hasCheckedAuth = true
        }
    }

    if (hasCheckedAuth) {
        PengamananNavHost(startDestination = startDestination)
    }
}
