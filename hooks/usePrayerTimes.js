// hooks/usePrayerTimes.js
import { useState, useEffect } from 'react';
import { fetchMonthlyTimes } from '../services/prayerApi';
import { PRAYERS } from '../constants/prayers';

export const usePrayerTimes = (districtId) => {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState({ label: 'BEKLENİYOR', remaining: '00:00:00', key: '', activeKey: '' });
  const [hijriDate, setHijriDate] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      setLoading(true);
      setTimes(null);
      
      const data = await fetchMonthlyTimes(districtId);
      
      if (isMounted && data && data.length > 0) {
        setTimes(data);
      }
      if (isMounted) setLoading(false);
    };
    init();

    return () => { isMounted = false; };
  }, [districtId]);

  useEffect(() => {
    if (!times || times.length === 0) return;

    const timer = setInterval(() => {
      const now = new Date();
      const dayIndex = now.getDate() - 1; 
      
      // Güvenli gün seçimi
      const todayData = times.length > dayIndex ? times[dayIndex] : times[times.length - 1];
      const tomorrowData = times.length > dayIndex + 1 ? times[dayIndex + 1] : times[0];

      // API'den gelen doğru Hicri Tarihi state'e yaz
      if (todayData?.hijri_date?.full_date) {
        setHijriDate(todayData.hijri_date.full_date);
      }

      let activePrayer = null;
      let upcomingPrayer = null;
      let upcomingTimeObj = null;

      for (let i = 0; i < PRAYERS.length; i++) {
        const prayer = PRAYERS[i];
        
        // ÇÖZÜM BURASI: Vakitler artık `times` objesinin içinden, küçük harfle çekiliyor!
        const timeStr = todayData?.times?.[prayer.key.toLowerCase()] || "00:00";
        const [hours, minutes] = timeStr.split(':');
        
        const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours, 10), parseInt(minutes, 10), 0);

        if (now < prayerTime) {
          upcomingPrayer = prayer;
          upcomingTimeObj = prayerTime;
          activePrayer = i === 0 ? PRAYERS[5] : PRAYERS[i - 1];
          break;
        }
      }

      if (!upcomingPrayer) {
        const timeStr = tomorrowData?.times?.imsak || "00:00";
        const [hours, minutes] = timeStr.split(':');
        upcomingPrayer = PRAYERS[0];
        upcomingTimeObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, parseInt(hours, 10), parseInt(minutes, 10), 0);
        activePrayer = PRAYERS[5];
      }

      const diff = upcomingTimeObj - now;
      if (diff > 0) {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setNextPrayer({
          label: upcomingPrayer.label,
          key: upcomingPrayer.key,
          activeKey: activePrayer?.key,
          remaining: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [times]);

  const getTodayTimesObj = () => {
    if (!times) return null;
    const dayIndex = new Date().getDate() - 1;
    const todayData = times.length > dayIndex ? times[dayIndex] : times[times.length - 1];
    
    // Alt objeden (`times`) ana objeye çeviriyoruz
    return {
      Imsak: todayData?.times?.imsak || "--:--",
      Gunes: todayData?.times?.gunes || "--:--",
      Ogle: todayData?.times?.ogle || "--:--",
      Ikindi: todayData?.times?.ikindi || "--:--",
      Aksam: todayData?.times?.aksam || "--:--",
      Yatsi: todayData?.times?.yatsi || "--:--",
    };
  };

  return { times: getTodayTimesObj(), loading, nextPrayer, hijriDate };
};