package expo.modules.miadnotify

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import android.os.Build
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import java.util.Calendar

data class PrayerItem(
    val key: String,
    val isim: String,
    val zaman: Long,
    val prevKey: String,
    val vakitler: Map<String, String>
)

data class PrayerState(
    val titleText: String,
    val isCountingDown: Boolean,
    val countdownBaseTime: Long,
    val activeVakit: String,
    val nextAlarmTime: Long,
    val nextAlarmAction: String,
    val vakitler: Map<String, String>
)

object PrayerScheduleHelper {
    const val CHANNEL_ID = "miad_sabit_bildirim"
    const val NOTIFICATION_ID = 888
    private const val PREFS_NAME = "miad_prayer_prefs"
    private const val KEY_SCHEDULE = "saved_schedule_json"
    private const val KEY_ENABLED = "sabit_bildirim_enabled"
    private const val KEY_AKTIF_VAKIT = "saved_aktif_vakit"

    fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun isServiceEnabled(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_ENABLED, true)
    }

    fun setServiceEnabled(context: Context, enabled: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_ENABLED, enabled).apply()
    }

    fun saveSchedule(
        context: Context,
        scheduleJson: String,
        vakitlerMap: Map<String, String>,
        aktifVakit: String
    ) {
        val editor = getPrefs(context).edit()
        editor.putString(KEY_SCHEDULE, scheduleJson)
        editor.putString(KEY_AKTIF_VAKIT, aktifVakit)
        editor.putBoolean(KEY_ENABLED, true)
        for ((k, v) in vakitlerMap) {
            editor.putString("time_${k.lowercase()}", v)
        }
        editor.apply()
    }

    fun getFallbackVakitler(context: Context): Map<String, String> {
        val prefs = getPrefs(context)
        val vList = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
        val map = mutableMapOf<String, String>()
        for (v in vList) {
            map[v] = prefs.getString("time_$v", "--:--") ?: "--:--"
        }
        return map
    }

    fun computeState(context: Context, now: Long = System.currentTimeMillis()): PrayerState {
        val prefs = getPrefs(context)
        val scheduleStr = prefs.getString(KEY_SCHEDULE, null)
        val fallbackVakitler = getFallbackVakitler(context)
        val lastAktif = prefs.getString(KEY_AKTIF_VAKIT, "yatsi")?.lowercase() ?: "yatsi"

        if (scheduleStr.isNullOrEmpty()) {
            return PrayerState(
                titleText = "Miad Namaz Vakitleri",
                isCountingDown = false,
                countdownBaseTime = 0L,
                activeVakit = lastAktif,
                nextAlarmTime = 0L,
                nextAlarmAction = "",
                vakitler = fallbackVakitler
            )
        }

        val items = mutableListOf<PrayerItem>()
        try {
            val jsonArray = JSONArray(scheduleStr)
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                val key = obj.getString("key").lowercase()
                val isim = obj.getString("isim")
                val zaman = obj.getLong("zaman")
                val prevKey = if (obj.has("prevKey")) obj.getString("prevKey").lowercase() else "yatsi"
                val vakitlerMap = mutableMapOf<String, String>()
                if (obj.has("vakitler")) {
                    val vObj = obj.getJSONObject("vakitler")
                    val keys = vObj.keys()
                    while (keys.hasNext()) {
                        val k = keys.next()
                        vakitlerMap[k.lowercase()] = vObj.getString(k)
                    }
                } else {
                    vakitlerMap.putAll(fallbackVakitler)
                }
                items.add(PrayerItem(key, isim, zaman, prevKey, vakitlerMap))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        if (items.isEmpty()) {
            return PrayerState(
                titleText = "Miad Namaz Vakitleri",
                isCountingDown = false,
                countdownBaseTime = 0L,
                activeVakit = lastAktif,
                nextAlarmTime = 0L,
                nextAlarmAction = "",
                vakitler = fallbackVakitler
            )
        }

        items.sortBy { it.zaman }

        // 1. Vakit Girdi Kontrolü (Son 60 saniye içinde vakit girdiyse bildirimde "Vakti Girdi" göster)
        for (item in items) {
            if (now >= item.zaman && now < item.zaman + 60_000L) {
                return PrayerState(
                    titleText = "${item.isim} vakti girdi",
                    isCountingDown = false,
                    countdownBaseTime = 0L,
                    activeVakit = item.key,
                    nextAlarmTime = item.zaman + 60_000L,
                    nextAlarmAction = MiadForegroundService.ACTION_SIRADAKI_GECIS,
                    vakitler = item.vakitler
                )
            }
        }

        // 2. Sıradaki Gelecek Vakit (Geri sayım başlat)
        for (item in items) {
            if (item.zaman > now) {
                val baseTime = SystemClock.elapsedRealtime() + (item.zaman - now)
                return PrayerState(
                    titleText = "${item.isim} vaktine kalan",
                    isCountingDown = true,
                    countdownBaseTime = baseTime,
                    activeVakit = item.prevKey,
                    nextAlarmTime = item.zaman,
                    nextAlarmAction = MiadForegroundService.ACTION_VAKIT_GIRDI,
                    vakitler = item.vakitler
                )
            }
        }

        // Liste tükenmişse en son vakti göster
        val lastItem = items.last()
        return PrayerState(
            titleText = "Vakitler Güncelleniyor",
            isCountingDown = false,
            countdownBaseTime = 0L,
            activeVakit = "yatsi",
            nextAlarmTime = 0L,
            nextAlarmAction = "",
            vakitler = lastItem.vakitler
        )
    }

    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val existing = notificationManager.getNotificationChannel(CHANNEL_ID)
            if (existing == null) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Namaz Vakti Takibi",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Kalıcı namaz vakti ve canlı geri sayım sayacı"
                    setSound(null, null)
                    enableVibration(false)
                    setShowBadge(false)
                }
                notificationManager.createNotificationChannel(channel)
            }
        }
    }

    fun buildNotification(context: Context, state: PrayerState): Notification {
        createNotificationChannel(context)
        val packageName = context.packageName

        val smallResId = context.resources.getIdentifier("custom_notif_small", "layout", packageName)
        val largeResId = context.resources.getIdentifier("custom_notif_large", "layout", packageName)

        val collapsedView = RemoteViews(packageName, smallResId)
        val expandedView = RemoteViews(packageName, largeResId)

        // Başlık ("Akşam vaktine kalan" veya "Akşam vakti girdi")
        val titleId = context.resources.getIdentifier("title", "id", packageName)
        if (titleId != 0) {
            collapsedView.setTextViewText(titleId, state.titleText)
            expandedView.setTextViewText(titleId, state.titleText)
        }

        // Chronometer Sayacı
        val chronoId = context.resources.getIdentifier("chronometer", "id", packageName)
        if (chronoId != 0) {
            if (state.isCountingDown) {
                collapsedView.setViewVisibility(chronoId, View.VISIBLE)
                expandedView.setViewVisibility(chronoId, View.VISIBLE)
                collapsedView.setChronometer(chronoId, state.countdownBaseTime, null, true)
                expandedView.setChronometer(chronoId, state.countdownBaseTime, null, true)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    collapsedView.setChronometerCountDown(chronoId, true)
                    expandedView.setChronometerCountDown(chronoId, true)
                }
            } else {
                collapsedView.setViewVisibility(chronoId, View.GONE)
                expandedView.setViewVisibility(chronoId, View.GONE)
            }
        }

        // 6'lı Vakit Tablosu Renk ve Değer Güncellemeleri
        val vList = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
        val aktifVakitLower = state.activeVakit.lowercase()

        for (v in vList) {
            val timeId = context.resources.getIdentifier("time_$v", "id", packageName)
            val vTitleId = context.resources.getIdentifier("title_$v", "id", packageName)

            val capKey = v.replaceFirstChar { it.uppercase() }
            val timeValue = state.vakitler[v] ?: state.vakitler[capKey] ?: "--:--"

            val isActive = (v == aktifVakitLower)
            val highlightColor = Color.parseColor("#10B981") // Aktif vakit vurgu rengi
            val defaultTextColor = Color.parseColor("#FFFFFF")
            val defaultTitleColor = Color.parseColor("#94A3B8")

            if (timeId != 0) {
                expandedView.setTextViewText(timeId, timeValue)
                expandedView.setTextColor(timeId, if (isActive) highlightColor else defaultTextColor)
            }
            if (vTitleId != 0) {
                expandedView.setTextColor(vTitleId, if (isActive) highlightColor else defaultTitleColor)
            }
        }

        // Uygulama Açılış Intent'i
        val appIntent = context.packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            appIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Swipe (Kaydırma) Engelleme: Kullanıcı swipe yapsa bile bildirimi anında yeniden canlandırır
        val reviveIntent = Intent(context, VakitReceiver::class.java).apply {
            action = MiadForegroundService.ACTION_REVIVE
        }
        val revivePending = PendingIntent.getBroadcast(
            context,
            999,
            reviveIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        var iconResId = context.resources.getIdentifier("ic_launcher", "mipmap", packageName)
        if (iconResId == 0) iconResId = context.applicationInfo.icon

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(iconResId)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setCustomContentView(collapsedView)
            .setCustomBigContentView(expandedView)
            .setOngoing(true) // Kalıcı sabit bildirim (Android < 14'te swipe engeller)
            .setAutoCancel(false) // Tıklanınca kaybolmaz
            .setOnlyAlertOnce(true) // Güncellendikçe ses/titreşim yapmaz
            .setDeleteIntent(revivePending) // Android 14+'te swipe yapılırsa derhal dirilt
            .setContentIntent(pendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC) // Kilit ekranında göster
            .setPriority(NotificationCompat.PRIORITY_LOW)

        val notification = builder.build()
        // Bayrakları sabitle
        notification.flags = notification.flags or NotificationCompat.FLAG_NO_CLEAR or NotificationCompat.FLAG_ONGOING_EVENT
        return notification
    }

    fun scheduleNextAlarm(context: Context, alarmTimeMs: Long, action: String) {
        if (alarmTimeMs <= System.currentTimeMillis() || action.isEmpty()) return

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, VakitReceiver::class.java).apply {
            this.action = action
        }
        val requestCode = if (action == MiadForegroundService.ACTION_VAKIT_GIRDI) 888 else 889
        val pendingAlarm = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, alarmTimeMs, pendingAlarm)
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, alarmTimeMs, pendingAlarm)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Gece 00:00:01 Widget güncelleme alarmını da kur
        scheduleMidnightAlarm(context)
    }

    fun scheduleMidnightAlarm(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val midnight = Calendar.getInstance().apply {
            timeInMillis = System.currentTimeMillis()
            add(Calendar.DAY_OF_YEAR, 1)
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 1)
            set(Calendar.MILLISECOND, 0)
        }

        val widgetIntent = Intent(context, VakitReceiver::class.java).apply {
            action = "WIDGET_UPDATE"
        }
        val widgetPending = PendingIntent.getBroadcast(
            context,
            777,
            widgetIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, midnight.timeInMillis, widgetPending)
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, midnight.timeInMillis, widgetPending)
            }
        } catch (e: Exception) {}
    }

    fun cancelAllAlarms(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val actions = listOf(
            Pair(MiadForegroundService.ACTION_VAKIT_GIRDI, 888),
            Pair(MiadForegroundService.ACTION_SIRADAKI_GECIS, 889),
            Pair(MiadForegroundService.ACTION_REVIVE, 999)
        )
        for ((act, code) in actions) {
            val intent = Intent(context, VakitReceiver::class.java).apply { action = act }
            val pi = PendingIntent.getBroadcast(
                context,
                code,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            if (pi != null) {
                alarmManager.cancel(pi)
                pi.cancel()
            }
        }
    }
}
