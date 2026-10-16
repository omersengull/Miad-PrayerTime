import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MiadNotify from '../modules/miad-notify';

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Namaz Vakitleri',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#10b981',
  });
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function bildirimIzniniAl() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function eskiBildirimleriTemizle() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function bildirimKur(vakitAdi, saatString, kacDakikaOnce) {
  if (!saatString || saatString === "--:--") return;

  const saatDakikaArr = saatString.split(':');
  let bildirimZamaniObjesi = new Date();
  bildirimZamaniObjesi.setHours(parseInt(saatDakikaArr[0], 10), parseInt(saatDakikaArr[1], 10), 0, 0);
  
  bildirimZamaniObjesi.setMinutes(bildirimZamaniObjesi.getMinutes() - kacDakikaOnce);

  if(bildirimZamaniObjesi.getTime() < Date.now()) {
    bildirimZamaniObjesi.setDate(bildirimZamaniObjesi.getDate() + 1);
  }

  // Süreyi okunabilir metne çevir
  const sureMetni = (dk) => {
    if (dk === 0) return null;
    const saat = Math.floor(dk / 60);
    const kalanDk = dk % 60;
    if (saat > 0 && kalanDk > 0) return `${saat} saat ${kalanDk} dakika`;
    if (saat > 0) return `${saat} saat`;
    return `${kalanDk} dakika`;
  };

  const sure = sureMetni(kacDakikaOnce);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Namaz Vakti Bildirimi",
      body: sure === null ? `${vakitAdi} vakti girdi.` : `${vakitAdi} vaktine ${sure} kaldı.`,
      sound: true, 
    },
    trigger: { 
      type: Notifications.SchedulableTriggerInputTypes.DATE, 
      date: bildirimZamaniObjesi, 
      channelId: 'default'
    },
  });
}

/**
 * Aylık ve günlük verileri birleştirerek Native servisin arka planda
 * kesintisiz çalışması için tam zaman çizelgesini (schedule) oluşturur.
 */
export function namazCizelgesiOlustur(monthlyTimes, todayTimesObj) {
  const schedule = [];
  const PRAYER_KEYS = [
    { key: "imsak", label: "İmsak", prevKey: "yatsi" },
    { key: "gunes", label: "Güneş", prevKey: "imsak" },
    { key: "ogle", label: "Öğle", prevKey: "gunes" },
    { key: "ikindi", label: "İkindi", prevKey: "ogle" },
    { key: "aksam", label: "Akşam", prevKey: "ikindi" },
    { key: "yatsi", label: "Yatsı", prevKey: "aksam" },
  ];

  if (Array.isArray(monthlyTimes) && monthlyTimes.length > 0) {
    for (const dayData of monthlyTimes) {
      if (!dayData?.date || !dayData?.times) continue;
      const dateParts = dayData.date.substring(0, 10).split("-");
      if (dateParts.length < 3) continue;

      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);

      const dayVakitler = {
        Imsak: dayData.times.imsak || "--:--",
        Gunes: dayData.times.gunes || "--:--",
        Ogle: dayData.times.ogle || "--:--",
        Ikindi: dayData.times.ikindi || "--:--",
        Aksam: dayData.times.aksam || "--:--",
        Yatsi: dayData.times.yatsi || "--:--",
      };

      for (const p of PRAYER_KEYS) {
        const timeStr = dayData.times[p.key];
        if (!timeStr || !timeStr.includes(":")) continue;
        const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
        const dt = new Date(year, month, day, h, m, 0, 0);

        schedule.push({
          key: p.key,
          isim: p.label,
          zaman: dt.getTime(),
          prevKey: p.prevKey,
          vakitler: dayVakitler,
        });
      }
    }
  }

  // Eğer monthlyTimes henüz yüklenmediyse bugünün vakitlerinden bugün ve yarını üret
  if (schedule.length === 0 && todayTimesObj) {
    const now = new Date();
    const gunler = [
      { offset: 0, times: todayTimesObj },
      { offset: 1, times: todayTimesObj },
    ];

    for (const g of gunler) {
      const d = new Date(now);
      d.setDate(d.getDate() + g.offset);
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();

      for (const p of PRAYER_KEYS) {
        const timeStr = g.times[p.label] || g.times[p.key];
        if (!timeStr || !timeStr.includes(":")) continue;
        const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
        const dt = new Date(year, month, day, h, m, 0, 0);

        schedule.push({
          key: p.key,
          isim: p.label,
          zaman: dt.getTime(),
          prevKey: p.prevKey,
          vakitler: todayTimesObj,
        });
      }
    }
  }

  // Zamana göre sırala
  schedule.sort((a, b) => a.zaman - b.zaman);

  // Dünden daha eski olanları çıkar
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return schedule.filter((s) => s.zaman >= cutoff);
}

/**
 * Sabit bildirim ve sayacı günceller / başlatır.
 */
export async function sabitBildirimiGuncelle(monthlyTimes, todayTimesObj, aktifVakitKey) {
  if (Platform.OS !== 'android') return;
  try {
    const ayar = await AsyncStorage.getItem('ayar_sabit_bildirim');
    if (ayar === 'false') return;

    const schedule = namazCizelgesiOlustur(monthlyTimes, todayTimesObj);
    const scheduleJSON = JSON.stringify(schedule);
    const activeKey = aktifVakitKey ? String(aktifVakitKey).toLowerCase() : 'yatsi';

    MiadNotify.gosterSabitBildirim(scheduleJSON, todayTimesObj || {}, activeKey);
  } catch (error) {
    console.log("Sabit bildirim hatası (Native):", error);
  }
}

/**
 * Kullanıcı uygulama içinden sabit bildirimi kapattığında foreground servisi durdurur.
 */
export async function sabitBildirimiDurdur() {
  if (Platform.OS !== 'android') return;
  try {
    await AsyncStorage.setItem('ayar_sabit_bildirim', 'false');
    if (MiadNotify.durdurSabitBildirim) {
      MiadNotify.durdurSabitBildirim();
    }
  } catch (error) {
    console.log("Sabit bildirim durdurma hatası:", error);
  }
}

/**
 * Kullanıcı uygulama içinden sabit bildirimi açtığında servisi yeniden başlatır.
 */
export async function sabitBildirimiBaslat(monthlyTimes, todayTimesObj, aktifVakitKey) {
  if (Platform.OS !== 'android') return;
  try {
    await AsyncStorage.setItem('ayar_sabit_bildirim', 'true');
    await sabitBildirimiGuncelle(monthlyTimes, todayTimesObj, aktifVakitKey);
  } catch (error) {
    console.log("Sabit bildirim başlatma hatası:", error);
  }
}

export async function pilOptimizasyonunuKontrolEt() {
  if (Platform.OS !== 'android') return;

  try {
    const uyariGosterildiMi = await AsyncStorage.getItem('pil_uyarisi_gosterildi');
    if (uyariGosterildiMi === 'true') return; 

    const optimizasyonAcikMi = await notifee.isBatteryOptimizationEnabled();

    if (optimizasyonAcikMi) {
      Alert.alert(
        "Bildirimler Gecikebilir ⚠️",
        "Telefonunuzun pil tasarrufu ayarları, namaz vakti bildirimlerinin sessize alınmasına veya geç çalmasına sebep olabilir. Bunu önlemek için kısıtlamayı kapatmak ister misiniz?",
        [
          { text: "Daha Sonra", style: "cancel", onPress: () => AsyncStorage.setItem('pil_uyarisi_gosterildi', 'true') },
          {
            text: "Ayarlara Git",
            onPress: async () => {
              await notifee.openBatteryOptimizationSettings();
              await AsyncStorage.setItem('pil_uyarisi_gosterildi', 'true');
            }
          }
        ]
      );
    }
  } catch (error) {
    console.log("Pil kontrol hatası:", error);
  }
}
