package expo.modules.miadnotify

import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.ServiceCompat

class MiadForegroundService : Service() {

    companion object {
        const val ACTION_START_OR_UPDATE = "expo.modules.miadnotify.START_OR_UPDATE"
        const val ACTION_STOP = "expo.modules.miadnotify.STOP"
        const val ACTION_VAKIT_GIRDI = "expo.modules.miadnotify.VAKIT_GIRDI"
        const val ACTION_SIRADAKI_GECIS = "expo.modules.miadnotify.SIRADAKI_GECIS"
        const val ACTION_REVIVE = "expo.modules.miadnotify.REVIVE"

        var isRunning = false
            private set
    }

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        PrayerScheduleHelper.createNotificationChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START_OR_UPDATE

        if (action == ACTION_STOP) {
            PrayerScheduleHelper.setServiceEnabled(this, false)
            PrayerScheduleHelper.cancelAllAlarms(this)

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                } else {
                    @Suppress("DEPRECATION")
                    stopForeground(true)
                }
            } catch (e: Exception) {}

            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.cancel(PrayerScheduleHelper.NOTIFICATION_ID)

            isRunning = false
            stopSelf()
            return START_NOT_STICKY
        }

        // Servis kullanıcı tarafından uygulama içinden kapatılmışsa başlatma
        if (!PrayerScheduleHelper.isServiceEnabled(this)) {
            isRunning = false
            stopSelf()
            return START_NOT_STICKY
        }

        // Güncel durumu ve sıradaki vakti hesapla
        val state = PrayerScheduleHelper.computeState(this)
        val notification = PrayerScheduleHelper.buildNotification(this, state)

        // Foreground Service olarak başlat / güncelle
        try {
            val serviceType = if (Build.VERSION.SDK_INT >= 34) {
                0x40000000 // ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            } else {
                0
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ServiceCompat.startForeground(
                    this,
                    PrayerScheduleHelper.NOTIFICATION_ID,
                    notification,
                    serviceType
                )
            } else {
                startForeground(PrayerScheduleHelper.NOTIFICATION_ID, notification)
            }
        } catch (e: Exception) {
            // Güvenlik amaçlı NotificationManager ile de güncelle
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.notify(PrayerScheduleHelper.NOTIFICATION_ID, notification)
        }

        // Sıradaki alarmı (Vakit girdi veya Sıradaki geçiş) kur
        if (state.nextAlarmTime > System.currentTimeMillis()) {
            PrayerScheduleHelper.scheduleNextAlarm(this, state.nextAlarmTime, state.nextAlarmAction)
        }

        isRunning = true
        return START_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
