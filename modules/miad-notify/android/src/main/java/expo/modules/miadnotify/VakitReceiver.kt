package expo.modules.miadnotify

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat

class VakitReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val packageName = context.packageName
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "miad_sabit_bildirim"

        val smallResId = context.resources.getIdentifier("custom_notif_small", "layout", packageName)
        val largeResId = context.resources.getIdentifier("custom_notif_large", "layout", packageName)
        if (smallResId == 0 || largeResId == 0) return

        val collapsedView = RemoteViews(packageName, smallResId)
        val expandedView = RemoteViews(packageName, largeResId)

        val titleId = context.resources.getIdentifier("title", "id", packageName)
        val chronoId = context.resources.getIdentifier("chronometer", "id", packageName)

        val vakitAdi = intent.getStringExtra("vakitAdi") ?: "Vakit"

        val vList = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
        for (v in vList) {
            val timeId = context.resources.getIdentifier("time_$v", "id", packageName)
            val saat = intent.getStringExtra("time_$v") ?: "--:--"
            if (timeId != 0) expandedView.setTextViewText(timeId, saat)
        }

        if (chronoId != 0) {
            collapsedView.setViewVisibility(chronoId, View.GONE)
            expandedView.setViewVisibility(chronoId, View.GONE)
        }

        if (titleId != 0) {
            val girisMetni = "$vakitAdi vakti girdi"
            collapsedView.setTextViewText(titleId, girisMetni)
            expandedView.setTextViewText(titleId, girisMetni)
        }

        var iconResId = context.resources.getIdentifier("ic_launcher", "mipmap", packageName)
        if (iconResId == 0) iconResId = context.applicationInfo.icon
        if (iconResId == 0) iconResId = android.R.drawable.ic_dialog_info

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(iconResId)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setCustomContentView(collapsedView)
            .setCustomBigContentView(expandedView)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)

        notificationManager.notify(888, builder.build())
    }
}