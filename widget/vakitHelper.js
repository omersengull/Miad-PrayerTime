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

// Tek seferde şehir + vakitleri okur (aynı AsyncStorage anahtarını iki kez okumamak için).
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
  } catch (e) {
    // saved_location bozuksa varsayılanlarla devam et, widget'ı çökertme
  }

  let vakitler = null;
  try {
    const cached = await AsyncStorage.getItem(`prayer_cache_${districtId}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (Array.isArray(data) && data.length > 0) {
        const dayIndex = new Date().getDate() - 1;
        const todayData = data[dayIndex] ?? data[data.length - 1];
        if (todayData?.times) {
          const t = todayData.times;
          // Hangi anahtar biçimiyle gelirse gelsin (küçük/büyük harf, Türkçe karakter) yakala
          const al = (...keys) => keys.map((k) => t[k]).find((v) => v != null) || null;
          vakitler = {
            imsak: al('imsak', 'Imsak', 'İmsak'),
            gunes: al('gunes', 'Gunes', 'Güneş'),
            ogle: al('ogle', 'Ogle', 'Öğle'),
            ikindi: al('ikindi', 'Ikindi', 'İkindi'),
            aksam: al('aksam', 'Aksam', 'Akşam'),
            yatsi: al('yatsi', 'Yatsi', 'Yatsı'),
          };
          // Hiçbir vakit bulunamadıysa null'a geri dön (tamamen boş obje göstermeyelim)
          if (Object.values(vakitler).every((v) => !v)) vakitler = null;
        }
      }
    }
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

// Sadece "şu an" ve "sıradaki" vakti bulur (canlı sayaç YOK — 30dk'da bir
// yenilenen bir widget'ta dakika hassasiyetinde geri sayım yanıltıcı olur).
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
