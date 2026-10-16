// widget/vakitHelper.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const VAKITLER = [
  { id: 'imsak', ad: 'İmsak', buyuk: 'İMSAK' },
  { id: 'gunes', ad: 'Güneş', buyuk: 'GÜNEŞ' },
  { id: 'ogle', ad: 'Öğle', buyuk: 'ÖĞLE' },
  { id: 'ikindi', ad: 'İkindi', buyuk: 'İKİNDİ' },
  { id: 'aksam', ad: 'Akşam', buyuk: 'AKŞAM' },
  { id: 'yatsi', ad: 'Yatsı', buyuk: 'YATSI' },
];

const pad = (n) => String(n).padStart(2, '0');

export async function getirWidgetVerisi() {
  let sehirAdi = 'İSTANBUL, Fatih';
  let districtId = '9541';

  try {
    const loc = await AsyncStorage.getItem('saved_location');
    if (loc) {
      const parsed = JSON.parse(loc);
      if (parsed?.name) sehirAdi = parsed.name;
      if (parsed?.id) districtId = parsed.id;
    }
  } catch (e) {}

  let vakitler = null;
  const cacheKey = `prayer_cache_${districtId}`;
  
  // Bugünden tarih stringi elde et (Örn: "2026-10-02")
  const getTodayFromData = (data) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    return data.find(d => d.date && d.date.startsWith(todayStr));
  };

  const parseTimes = (todayData) => {
    if (!todayData?.times) return null;
    const t = todayData.times;
    const al = (...keys) => keys.map((k) => t[k]).find((v) => v != null) || null;
    const v = {
      imsak: al('imsak', 'Imsak', 'İmsak'),
      gunes: al('gunes', 'Gunes', 'Güneş'),
      ogle: al('ogle', 'Ogle', 'Öğle'),
      ikindi: al('ikindi', 'Ikindi', 'İkindi'),
      aksam: al('aksam', 'Aksam', 'Akşam'),
      yatsi: al('yatsi', 'Yatsi', 'Yatsı'),
    };
    if (Object.values(v).every((val) => !val)) return null;
    return v;
  };

  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    let todayData = null;

    // 1. Önce Cache içinden bugünü bulmayı dene
    if (cached) {
      const data = JSON.parse(cached);
      if (Array.isArray(data)) {
        todayData = getTodayFromData(data);
      }
    }

    // 2. Cache'de bugün yoksa (Ay değiştiyse vs.) Arka planda yeni ay verisini API'den çek!
    if (!todayData) {
      try {
        const res = await fetch(`https://ezanvakti.imsakiyem.com/api/prayer-times/${districtId}/monthly`);
        if (res.ok) {
          const result = await res.json();
          const newData = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : null);
          if (newData && newData.length > 0) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(newData));
            todayData = getTodayFromData(newData);
          }
        }
      } catch (e) {
        console.log("Widget API fetch hatasi:", e);
      }
    }

    vakitler = parseTimes(todayData);
  } catch (e) {
    console.log('Widget vakit okuma hatası:', e);
  }

  return { sehirAdi, vakitler };
}

const dk = (t) => {
  if (!t) return null;
  const m = String(t).match(/(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

export function hesapla(vakitler, now = new Date()) {
  if (!vakitler) return {};
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const list = VAKITLER.map((v) => ({ ...v, dk: dk(vakitler[v.id]) })).filter((v) => v.dk != null);
  if (list.length === 0) return {};

  let nextIdx = list.findIndex((v) => v.dk > nowMin);
  let curIdx;
  if (nextIdx === -1) {
    nextIdx = 0;
    curIdx = list.length - 1;
  } else if (nextIdx === 0) {
    curIdx = list.length - 1;
  } else {
    curIdx = nextIdx - 1;
  }

  return { siradakiId: list[nextIdx].id, suAnId: list[curIdx].id };
}

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function tarihMetni(d = new Date()) {
  return `Bugün: ${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()} ${GUNLER[d.getDay()]}`;
}