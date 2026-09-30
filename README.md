# 🕌 Miad Prayer Time

Modern, minimalist ve "Offline-First" (internetsiz çalışabilen) mimariyle tasarlanmış, **React Native & Expo** tabanlı yeni nesil İslami yaşam ve namaz vakti uygulaması. Apple standartlarında **Glassmorphism (Cam Efekti)** arayüzü ile kullanıcıya huzurlu ve akıcı bir deneyim sunar.

## 📱 Ekran Görüntüleri

<p align="center">
  <img src="assets/screenshots/screen-1.png" width="24%" />
  <img src="assets/screenshots/screen-2.png" width="24%" />
  <img src="assets/screenshots/screen-3.png" width="24%" />
  <img src="assets/screenshots/screen-4.png" width="24%" />
</p>
<p align="center">
  <img src="assets/screenshots/screen-5.png" width="24%" />
  <img src="assets/screenshots/screen-6.png" width="24%" />
  <img src="assets/screenshots/screen-7.png" width="24%" />
</p>

## 📥 İndir ve Kur (Kullanıcılar İçin)
Uygulamanın en güncel Android (APK) sürümünü indirmek için sağ taraftaki **Releases** bölümüne gidebilir veya [Buraya Tıklayarak İndirebilirsiniz](#).

---

## 🌟 Öne Çıkan Özellikler

* **⏱️ Kesintisiz ve İsabetli Vakitler:** Diyanet verileriyle %100 uyumlu, cihazın konumunu otomatik bulan (GPS) sistem.
* **📴 Çevrimdışı (Offline) Destek:** API'den 30 günlük veriyi tek seferde önbelleğe (Cache) alır. İnternet bağlantısı olmadan da çalışır.
* **🔔 Gelişmiş Bildirim Motoru:** Android'in çekirdek `Chronometer` API'si kullanılarak bildirim çubuğuna sabitlenen ve saniye saniye geriye sayan namaz sayacı.
* **⏰ Özelleştirilebilir Alarmlar:** Her vakit için "Tam Vaktinde", "15, 30, 45 Dakika Önce" gibi yerel bildirim (Local Notification) kurma imkanı.
* **📿 Akıllı Zikirmatik:** 33'lü döngülerde titreşimli geri bildirim (Haptic Feedback) sağlayan zikir takip sistemi.
* **🧭 Kıble Pusulası:** Cihazın manyetometre sensörünü kullanarak hesaplanan Kabe yönü bulucu.
* **📖 Günün İçeriği & Esma'ül Hüsna:** Her gün o güne özel Ayet, Hadis ve Allah'ın 99 ismi ana ekranda sunulur.
* **📅 30 Günlük İmsakiye & Dini Günler:** Aylık vakit takvimi ve yıllık dini günler listesi.

---

## 🛠️ Kullanılan Teknolojiler & Kütüphaneler

* **Framework:** React Native, Expo
* **Veri & Durum Yönetimi:** React Hooks, `@react-native-async-storage/async-storage`
* **Konum & Sensörler:** `expo-location`, `expo-sensors` (Magnetometer)
* **Bildirimler:** `expo-notifications`, `@notifee/react-native`
* **Kullanıcı Deneyimi & Tasarım:** `expo-haptics`, SVG, Glassmorphism UI

---

## 💻 Geliştiriciler İçin Kurulum (Local Development)

### 1. Gereksinimler
* [Node.js](https://nodejs.org/) (v18 veya üzeri)
* [pnpm](https://pnpm.io/) paket yöneticisi
* Android Studio (Android SDK ve Emülatör kurulumu yapılmış olmalı)
* Global EAS CLI (`npm install -g eas-cli`)

### 2. Kurulum

```bash
# Projeyi bilgisayarınıza klonlayın
git clone [https://github.com/KULLANICI_ADIN/Miad-PrayerTime.git](https://github.com/KULLANICI_ADIN/Miad-PrayerTime.git)

# Proje dizinine girin
cd Miad-PrayerTime

# Bağımlılıkları yükleyin
pnpm install

3. Çalıştırma

    Önemli Not: Projede @notifee/react-native gibi Native modüller bulunduğu için standart Expo Go uygulamasında bildirimler ve sensörler doğrudan çalışmaz. Geliştirme için Expo Dev Client kullanılmalıdır.

Bash

# Android için yerel geliştirici sürümünü (Dev Client) derleyip başlatmak:
pnpm exec expo run:android

# VEYA EAS ile yerel ortamda Development Build almak:
eas build --profile development --platform android --local

# Üretime (Production) hazır APK almak:
eas build --profile production --platform android --local
