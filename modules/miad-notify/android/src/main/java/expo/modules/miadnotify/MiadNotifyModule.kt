package expo.modules.miadnotify

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.SystemClock
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MiadNotifyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MiadNotify")

    Function("gosterSabitBildirim") { hedefIsim: String, hedefZaman: Double, vakitler: Map<String, String>, aktifVakit: String ->
      val context = appContext.reactContext ?: throw Exception("React Context bulunamadi")
      val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      val channelId = "miad_sabit_bildirim"

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = NotificationChannel(channelId, "Namaz Vakti Takibi", NotificationManager.IMPORTANCE_LOW).apply {
          setSound(null, null)
          enableVibration(false)
        }
        notificationManager.createNotificationChannel(channel)
      }

      val packageName = context.packageName
      val style = NotificationCompat.DecoratedCustomViewStyle()

      val smallResId = context.resources.getIdentifier("custom_notif_small", "layout", packageName)
      val largeResId = context.resources.getIdentifier("custom_notif_large", "layout", packageName)
      
      if (smallResId == 0 || largeResId == 0) {
         throw Exception("XML layout dosyalari (custom_notif_small / large) res/layout klasöründe bulunamadi!")
      }

      val collapsedView = RemoteViews(packageName, smallResId)
      val expandedView = RemoteViews(packageName, largeResId)

      val vList = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
      
      for (v in vList) {
          val cap = v.replaceFirstChar { it.uppercase() }
          val timeId = context.resources.getIdentifier("time_$v", "id", packageName)
          val titleId = context.resources.getIdentifier("title_$v", "id", packageName)

          if (timeId != 0) expandedView.setTextViewText(timeId, vakitler[cap] ?: "--:--")
          if (titleId != 0) expandedView.setTextColor(titleId, Color.parseColor("#94A3B8"))
      }

      // Başlık Metni ("Akşam vaktine kalan")
      val formattedHedef = hedefIsim.lowercase().replaceFirstChar { it.uppercase() }
      val titleText = "$formattedHedef vaktine kalan"
      
      val titleId = context.resources.getIdentifier("title", "id", packageName)
      if (titleId != 0) {
          collapsedView.setTextViewText(titleId, titleText)
          expandedView.setTextViewText(titleId, titleText)
      }
      
      // Sayaç Hesabı ve Başlatma
      val baseTime = SystemClock.elapsedRealtime() + (hedefZaman.toLong() - System.currentTimeMillis())
      val chronoId = context.resources.getIdentifier("chronometer", "id", packageName)
      
      if (chronoId != 0) {
          collapsedView.setChronometer(chronoId, baseTime, null, true)
          expandedView.setChronometer(chronoId, baseTime, null, true)

          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
              collapsedView.setChronometerCountDown(chronoId, true)
              expandedView.setChronometerCountDown(chronoId, true)
          }
      }

      val intent = context.packageManager.getLaunchIntentForPackage(packageName)
      val pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

      var iconResId = context.resources.getIdentifier("ic_launcher", "mipmap", packageName)
      if (iconResId == 0) iconResId = context.applicationInfo.icon

      val builder = NotificationCompat.Builder(context, channelId)
        .setSmallIcon(iconResId)
        .setStyle(style)
        .setCustomContentView(collapsedView)
        .setCustomBigContentView(expandedView)
        .setOngoing(true)
        .setContentIntent(pendingIntent)
        .setPriority(NotificationCompat.PRIORITY_LOW)

      notificationManager.notify(888, builder.build())
    }
  }
}
