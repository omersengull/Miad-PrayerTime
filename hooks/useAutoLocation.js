// hooks/useAutoLocation.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { fetchCities, fetchDistricts } from '../services/prayerApi';

export const useAutoLocation = () => {
  const [location, setLocation] = useState({ id: '9541', name: 'İSTANBUL, Fatih' });
  const [isLocating, setIsLocating] = useState(false);

  const getId = (item) => item?.IlceID || item?.DistrictID || item?.Id || item?.id || item?.SehirID || item?.StateID || item?._id;
  const getName = (item) => item?.IlceAdi || item?.SehirAdi || item?.name_tr || item?.name || item?.Name || item?.DistrictName || item?.StateName;

  const normalize = (text) => {
    if (!text) return "";
    return text.toString()
      .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
      .replace(/Ş/g, "s").replace(/ş/g, "s")
      .replace(/Ç/g, "c").replace(/ç/g, "c")
      .replace(/Ğ/g, "g").replace(/ğ/g, "g")
      .replace(/Ö/g, "o").replace(/ö/g, "o")
      .replace(/Ü/g, "u").replace(/ü/g, "u")
      .replace(/province/gi, "").replace(/merkez/gi, "").replace(/town/gi, "")
      .toLowerCase()
      .trim();
  };

  const findMyLocation = async (showMessage = false) => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        if (showMessage) Alert.alert("Hata", "Konum izni vermeniz gerekiyor.");
        setIsLocating(false); return; 
      }

     const currentPos = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Highest, // Uydu GPS'ini zorlar
  maximumAge: 10000 // Son 10 saniyeden eski önbellek verisini kabul etmez
});
      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude: currentPos.coords.latitude,
        longitude: currentPos.coords.longitude
      });

      if (geocodeResult && geocodeResult.length > 0) {
        const place = geocodeResult[0];
        const detectedCity = place.region || place.adminArea || place.city;
        
        // Android için tüm olası ilçe verilerini birleştirip arayacağız
        const possibleDistricts = [place.subregion, place.district, place.city, place.street].filter(Boolean);

        if (detectedCity) {
          const cities = await fetchCities();
          const matchedCity = cities.find(c => normalize(detectedCity).includes(normalize(getName(c))));

          if (matchedCity) {
            const cityId = getId(matchedCity);
            const districts = await fetchDistricts(cityId);
            
            let matchedDistrict = null;

            // Bulduğumuz adres parçalarının hepsini API ilçeleriyle tek tek kıyasla
            for (let possibleDist of possibleDistricts) {
              const pDistNorm = normalize(possibleDist);
              matchedDistrict = districts.find(d => {
                const dNorm = normalize(getName(d));
                return dNorm === pDistNorm || pDistNorm.includes(dNorm) || dNorm.includes(pDistNorm);
              });
              if (matchedDistrict) break; // Bulduysa aramayı kes
            }

            if (!matchedDistrict && districts.length > 0) {
              matchedDistrict = districts.find(d => normalize(getName(d)).includes("merkez")) || districts[0];
            }

            if (matchedDistrict) {
              const finalName = `${getName(matchedCity).toLocaleUpperCase('tr-TR')}, ${getName(matchedDistrict)}`;
              setLocation({ id: getId(matchedDistrict), name: finalName });
              if (showMessage) Alert.alert("Başarılı", `Konumunuz tespit edildi:\n${finalName}`);
            }
          } else {
             if (showMessage) Alert.alert("Hata", "İl bulunamadı.");
          }
        }
      }
    } catch (error) {
      if (showMessage) Alert.alert("GPS Hatası", "Konum alınamıyor.");
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => { findMyLocation(false); }, []);

  return { location, setLocation, isLocating, findMyLocation };
};