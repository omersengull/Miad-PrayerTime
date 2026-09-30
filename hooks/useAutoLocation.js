// hooks/useAutoLocation.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // EKLENDİ
import { fetchCities, fetchDistricts } from '../services/prayerApi';

export const useAutoLocation = () => {
  const [location, setLocation] = useState({ id: '9541', name: 'İSTANBUL, Fatih' });
  const [isLocating, setIsLocating] = useState(true);

  const getId = (item) => item?.IlceID || item?.DistrictID || item?.Id || item?.id || item?.SehirID || item?.StateID || item?._id;
  const getName = (item) => item?.IlceAdi || item?.SehirAdi || item?.name_tr || item?.name || item?.Name || item?.DistrictName || item?.StateName;

  const normalize = (text) => {
    if (!text) return "";
    return text.toString().replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").replace(/Ş/g, "s").replace(/ş/g, "s").replace(/Ç/g, "c").replace(/ç/g, "c").replace(/Ğ/g, "g").replace(/ğ/g, "g").replace(/Ö/g, "o").replace(/ö/g, "o").replace(/Ü/g, "u").replace(/ü/g, "u").replace(/province/gi, "").replace(/merkez/gi, "").replace(/town/gi, "").toLowerCase().trim();
  };

  const findMyLocation = async (showMessage = false) => {
    try {
      if (showMessage) setIsLocating(true); // Sadece butona basıldıysa loading göster
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (showMessage) Alert.alert("Hata", "Konum izni vermeniz gerekiyor.");
        setIsLocating(false); return; 
      }

      // HIZLANDIRMA: Önce saniyesinde yanıt veren "Son bilinen konumu" iste
      let currentPos = await Location.getLastKnownPositionAsync({});
      if (!currentPos) {
        // Eğer o yoksa düşük hassasiyette (hızlı) güncel konumu iste
        currentPos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      }

      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude: currentPos.coords.latitude,
        longitude: currentPos.coords.longitude
      });

      if (geocodeResult && geocodeResult.length > 0) {
        const place = geocodeResult[0];
        const detectedCity = place.region || place.adminArea || place.city;
        const possibleDistricts = [place.subregion, place.district, place.city, place.street].filter(Boolean);

        if (detectedCity) {
          const cities = await fetchCities();
          const matchedCity = cities.find(c => normalize(detectedCity).includes(normalize(getName(c))));

          if (matchedCity) {
            const cityId = getId(matchedCity);
            const districts = await fetchDistricts(cityId);
            
            let matchedDistrict = null;
            for (let possibleDist of possibleDistricts) {
              const pDistNorm = normalize(possibleDist);
              matchedDistrict = districts.find(d => {
                const dNorm = normalize(getName(d));
                return dNorm === pDistNorm || pDistNorm.includes(dNorm) || dNorm.includes(pDistNorm);
              });
              if (matchedDistrict) break; 
            }

            if (!matchedDistrict && districts.length > 0) {
              matchedDistrict = districts.find(d => normalize(getName(d)).includes("merkez")) || districts[0];
            }

            if (matchedDistrict) {
              const finalName = `${getName(matchedCity).toLocaleUpperCase('tr-TR')}, ${getName(matchedDistrict)}`;
              const finalLocation = { id: getId(matchedDistrict), name: finalName };
              
              // Ekrana yansıt ve HAFIZAYA KAYDET
              setLocation(finalLocation);
              await AsyncStorage.setItem('saved_location', JSON.stringify(finalLocation));
              
              if (showMessage) Alert.alert("Başarılı", `Konumunuz güncellendi:\n${finalName}`);
            }
          }
        }
      }
    } catch (error) {
      if (showMessage) Alert.alert("GPS Hatası", "Konum alınamıyor.");
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    // UYGULAMA AÇILDIĞINDA ÇALIŞAN KOD
    const loadInitialLocation = async () => {
      // 1. Hafızada daha önce kaydedilmiş bir konum var mı bak
      const saved = await AsyncStorage.getItem('saved_location');
      if (saved) {
        setLocation(JSON.parse(saved));
        setIsLocating(false); // HAFIZADAN BULDUK, EKRANI ANINDA AÇ! (0 Saniye bekleme)
        
        // 2. Ekran açıldıktan sonra arka planda sessizce konumu doğrula
        findMyLocation(false); 
      } else {
        // İlk defa yükleyen biri ise mecburen GPS'i bekleteceğiz
        findMyLocation(false);
      }
    };
    
    loadInitialLocation();
  }, []);

  // Kullanıcı Manuel Şehir Seçtiğinde de hafızaya kaydetmemiz lazım
  const handleSetLocation = async (newLoc) => {
    setLocation(newLoc);
    await AsyncStorage.setItem('saved_location', JSON.stringify(newLoc));
  };

  return { location, setLocation: handleSetLocation, isLocating, findMyLocation };
};
