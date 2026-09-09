// services/prayerApi.js
export async function fetchMonthlyTimes(districtId = "9541") {
  ("-----------------------------------------");
  (`[TEST ADIM 1] Vakitler için istek atılıyor... İlçe ID: ${districtId}`);
  
  try {
    const response = await fetch(`https://ezanvakti.imsakiyem.com/api/prayer-times/${districtId}/monthly`, {
      headers: { Accept: 'application/json' }
    });
    
    (`[TEST ADIM 2] API HTTP Yanıt Kodu: ${response.status}`);
    
    const rawText = await response.text();
    (`[TEST ADIM 3] API'den Gelen Ham Veri (İlk 200 karakter):`, rawText.substring(0, 200));

    if (!response.ok) {
      ("[HATA] API 200 OK dönmedi!");
      return null;
    }
    
    const result = JSON.parse(rawText);
    const data = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : null);

    (`[TEST ADIM 4] Ayrıştırılan Veri Uzunluğu: ${data ? data.length : 'Bozuk/Null'}`);

    if (data && data.length > 0) {
      (`[TEST ADIM 5] Örnek İlk Gün Verisi:`, JSON.stringify(data[0]));
      return data;
    }

    ("[HATA] Veri dizisi boş geldi!");
    return null;
  } catch (error) {
    ("[SİSTEM HATASI] Fetch işlemi çöktü:", error.message);
    return null;
  }
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