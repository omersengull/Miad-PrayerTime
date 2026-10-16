package expo.modules.miadnotify

import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MiadNotifyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MiadNotify")

    // Kalıcı Bildirim ve Canlı Sayacı Başlat / Güncelle
    Function("gosterSabitBildirim") { scheduleJSON: String, vakitler: Map<String, String>, aktifVakit: String ->
      val context = appContext.reactContext ?: throw Exception("React Context bulunamadi")

      // Çizelgeyi ve vakitleri hafızaya kaydet
      PrayerScheduleHelper.saveSchedule(context, scheduleJSON, vakitler, aktifVakit)

      // Foreground servisi başlat veya güncelle
      val serviceIntent = Intent(context, MiadForegroundService::class.java).apply {
        action = MiadForegroundService.ACTION_START_OR_UPDATE
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

    // Uygulama İçinden Kalıcı Bildirimi Durdur
    Function("durdurSabitBildirim") {
      val context = appContext.reactContext ?: return@Function Unit
      val serviceIntent = Intent(context, MiadForegroundService::class.java).apply {
        action = MiadForegroundService.ACTION_STOP
      }
      try {
        context.startService(serviceIntent)
      } catch (e: Exception) {
        e.printStackTrace()
      }
      return@Function Unit
    }

    // Bildirim ve Servis Durumu
    Function("bildirimAktifMi") {
      val context = appContext.reactContext ?: return@Function false
      return@Function PrayerScheduleHelper.isServiceEnabled(context)
    }
  }
}