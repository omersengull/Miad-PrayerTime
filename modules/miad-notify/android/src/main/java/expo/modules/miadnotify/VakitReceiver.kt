package expo.modules.miadnotify

import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.content.ContextCompat

class VakitReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        // Gece 00:00:01 olduğunda Widget'ı güncelle ve bildirimi yeni günün vakitlerine geçir
        if (action == "WIDGET_UPDATE") {
            try {
                val providerClass = Class.forName("com.reactnativeandroidwidget.RNWidgetProvider")
                val widgetIntent = Intent(context, providerClass).apply {
                    this.action = android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    val ids = android.appwidget.AppWidgetManager.getInstance(context)
                        .getAppWidgetIds(ComponentName(context, providerClass))
                    putExtra(android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                }
                context.sendBroadcast(widgetIntent)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Bildirimi yeni günün vakitlerine ve sıradaki imsağa güncelle
            forwardToService(context, MiadForegroundService.ACTION_START_OR_UPDATE)
            return
        }

        // Cihaz yeniden başladığında (BOOT_COMPLETED) kalıcı bildirimi tekrar canlandır
        if (action == Intent.ACTION_BOOT_COMPLETED || action == "android.intent.action.QUICKBOOT_POWERON" || action == "android.intent.action.LOCKED_BOOT_COMPLETED") {
            if (PrayerScheduleHelper.isServiceEnabled(context)) {
                forwardToService(context, MiadForegroundService.ACTION_START_OR_UPDATE)
            }
            return
        }

        // VAKIT_GIRDI, SIRADAKI_GECIS veya REVIVE (kullanıcı swipe yaptıysa)
        forwardToService(context, action)
    }

    private fun forwardToService(context: Context, action: String) {
        if (!PrayerScheduleHelper.isServiceEnabled(context)) return

        val serviceIntent = Intent(context, MiadForegroundService::class.java).apply {
            this.action = action
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ContextCompat.startForegroundService(context, serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}