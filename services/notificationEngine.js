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


export async function sabitBildirimiGuncelle(hedefVakitObjesi, hedefZamanObjesi, gununVakitleri, aktifVakitObjesi) {
  if (Platform.OS !== 'android') return;

  try {
    const hedefIsim = hedefVakitObjesi.label;
    const timestamp = hedefZamanObjesi.getTime();
    const aktifKey = aktifVakitObjesi ? aktifVakitObjesi.key : 'Yatsi';

    // Native tarafa yolla
    MiadNotify.gosterSabitBildirim(hedefIsim, timestamp, gununVakitleri, aktifKey);
    
  } catch (error) {
    // EĞER ÇÖKERSE EKRANDA GÖSTERECEK!
    console.log("Sabit bildirim hatası (Native):", error);
    Alert.alert("Bildirim Motoru Çöktü!", String(error)); 
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
