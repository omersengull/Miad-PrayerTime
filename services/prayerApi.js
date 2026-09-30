// services/prayerApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function fetchMonthlyTimes(districtId = "9541") {
  const cacheKey = `prayer_cache_${districtId}`;
  
  try {
    // 1. Önce taze veri için internete çıkmayı dene
    const response = await fetch(`https://ezanvakti.imsakiyem.com/api/prayer-times/${districtId}/monthly`, {
      headers: { Accept: 'application/json' }
    });
    
    if (response.ok) {
      const result = await response.json();
      const data = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : null);

      // Veri taze ve sağlamsa hem geri döndür hem de internetsiz anlar için HAFIZAYA KAYDET
      if (data && data.length > 0) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }
    }
  } catch (error) {
    console.log("İnternet bağlantısı yok, hafızadaki (Offline) veriler denenecek...");
  }

  // 2. İNTERNET YOKSA VEYA API ÇÖKMÜŞSE: Hafızadaki veriyi kullan (Offline Mode)
  try {
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (e) {
    console.log("Hafıza okuma hatası", e);
  }

  // Hem internet yoksa hem hafıza boşsa null döner
  return null;
}

export async function fetchCities() {
  try {
    const res = await fetch("https://ezanvakti.imsakiyem.com/api/locations/states?countryId=2");
    const json = await res.json();
    return Array.isArray(json) ? json : (json?.data || []);
  } catch (e) { return []; }
}

export async function fetchDistricts(stateId) {
  try {
    const res = await fetch(`https://ezanvakti.imsakiyem.com/api/locations/districts?stateId=${stateId}`);
    const json = await res.json();
    return Array.isArray(json) ? json : (json?.data || []);
  } catch (e) { return []; }
}
