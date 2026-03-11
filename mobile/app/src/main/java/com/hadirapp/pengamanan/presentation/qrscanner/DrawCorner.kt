package com.hadirapp.pengamanan.presentation.qrscanner

import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.dp

enum class DrawCorner { TopStart, TopEnd, BottomStart, BottomEnd }

fun Modifier.drawCorner(
    color: Color,
    strokeWidth: Dp,
    corner: DrawCorner
): Modifier = this.drawWithContent {
    drawContent()
    val cornerSize = size.width
    val stroke = Stroke(width = strokeWidth.toPx(), pathEffect = null)

    when (corner) {
        DrawCorner.TopStart -> {
            drawRoundRect(
                color = color,
                style = stroke,
                cornerRadius = CornerRadius(cornerSize, cornerSize),
                topLeft = androidx.compose.ui.geometry.Offset(0f, 0f),
                size = androidx.compose.ui.geometry.Size(cornerSize, cornerSize)
            )
        }
        DrawCorner.TopEnd -> {
            drawRoundRect(
                color = color,
                style = stroke,
                cornerRadius = CornerRadius(cornerSize, cornerSize),
                topLeft = androidx.compose.ui.geometry.Offset(size.width - cornerSize, 0f),
                size = androidx.compose.ui.geometry.Size(cornerSize, cornerSize)
            )
        }
        DrawCorner.BottomStart -> {
            drawRoundRect(
                color = color,
                style = stroke,
                cornerRadius = CornerRadius(cornerSize, cornerSize),
                topLeft = androidx.compose.ui.geometry.Offset(0f, size.height - cornerSize),
                size = androidx.compose.ui.geometry.Size(cornerSize, cornerSize)
            )
        }
        DrawCorner.BottomEnd -> {
            drawRoundRect(
                color = color,
                style = stroke,
                cornerRadius = CornerRadius(cornerSize, cornerSize),
                topLeft = androidx.compose.ui.geometry.Offset(size.width - cornerSize, size.height - cornerSize),
                size = androidx.compose.ui.geometry.Size(cornerSize, cornerSize)
            )
        }
    }
}
