// hooks/usePrayerTimes.js
import { useState, useEffect } from "react";
import { fetchMonthlyTimes } from "../services/prayerApi";
import { PRAYERS } from "../constants/prayers";
import { sabitBildirimiGuncelle } from "../services/notificationEngine";
export const usePrayerTimes = (districtId) => {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hijriDate, setHijriDate] = useState("");
  const [nextPrayer, setNextPrayer] = useState({
    label: "BEKLENİYOR",
    remaining: "00:00:00",
    key: "",
    activeKey: "",
    progress: 1,
  });

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      setTimes(null);
      const data = await fetchMonthlyTimes(districtId);
      if (isMounted && data && data.length > 0) setTimes(data);
      if (isMounted) setLoading(false);
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [districtId]);

  useEffect(() => {
    if (!times || times.length === 0) return;

    // Sabit bildirimi sadece hedef vakit değiştiğinde güncelle (saniyede 1 kez değil).
    const sonGuncellenenHedef = { key: null };

    const timer = setInterval(() => {
      const now = new Date();
      const dayIndex = now.getDate() - 1;

      const todayData =
        times.length > dayIndex ? times[dayIndex] : times[times.length - 1];
      const tomorrowData =
        times.length > dayIndex + 1 ? times[dayIndex + 1] : times[0];

      if (todayData?.hijri_date?.full_date)
        setHijriDate(todayData.hijri_date.full_date);

      let activePrayer = null;
      let upcomingPrayer = null;
      let upcomingTimeObj = null;
      let activeTimeObj = null;

      for (let i = 0; i < PRAYERS.length; i++) {
        const prayer = PRAYERS[i];
        const timeStr = todayData?.times?.[prayer.key.toLowerCase()] || "00:00";
        const [hours, minutes] = timeStr.split(":");

        const prayerTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          parseInt(hours, 10),
          parseInt(minutes, 10),
          0,
        );

        if (now < prayerTime) {
          upcomingPrayer = prayer;
          upcomingTimeObj = prayerTime;
          activePrayer = i === 0 ? PRAYERS[5] : PRAYERS[i - 1];

          if (i === 0) {
            const yatsiStr = todayData?.times?.yatsi || "00:00";
            const [aH, aM] = yatsiStr.split(":");
            activeTimeObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - 1,
              parseInt(aH, 10),
              parseInt(aM, 10),
              0,
            );
          } else {
            const prevKey = PRAYERS[i - 1].key.toLowerCase();
            const prevStr = todayData?.times?.[prevKey] || "00:00";
            const [aH, aM] = prevStr.split(":");
            activeTimeObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              parseInt(aH, 10),
              parseInt(aM, 10),
              0,
            );
          }

          break;
        }
      }

      if (!upcomingPrayer) {
        const timeStr = tomorrowData?.times?.imsak || "00:00";
        const [hours, minutes] = timeStr.split(":");
        upcomingPrayer = PRAYERS[0];
        upcomingTimeObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          parseInt(hours, 10),
          parseInt(minutes, 10),
          0,
        );
        activePrayer = PRAYERS[5];

        const yatsiStr = todayData?.times?.yatsi || "00:00";
        const [aH, aM] = yatsiStr.split(":");
        activeTimeObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          parseInt(aH, 10),
          parseInt(aM, 10),
          0,
        );
      }

      const diff = upcomingTimeObj - now;

      if (diff > 0) {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        let progressVal = 1;
        if (activeTimeObj) {
          const totalMs = upcomingTimeObj.getTime() - activeTimeObj.getTime();
          progressVal = diff / totalMs;
          progressVal = Math.max(0, Math.min(1, progressVal));
        }

        setNextPrayer({
          label: upcomingPrayer.label,
          key: upcomingPrayer.key,
          activeKey: activePrayer?.key,
          remaining: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
          progress: progressVal,
        });

    
        const hedefAnahtar = `${upcomingPrayer.key}_${upcomingTimeObj.getTime()}`;
        if (sonGuncellenenHedef.key !== hedefAnahtar) {
          sonGuncellenenHedef.key = hedefAnahtar;
          sabitBildirimiGuncelle(
            upcomingPrayer,
            upcomingTimeObj,
            getTodayTimesObj(),
            activePrayer,
          );
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [times]);

  const getTodayTimesObj = () => {
    if (!times) return null;
    const dayIndex = new Date().getDate() - 1;
    const todayData =
      times.length > dayIndex ? times[dayIndex] : times[times.length - 1];

    return {
      Imsak: todayData?.times?.imsak || "--:--",
      Gunes: todayData?.times?.gunes || "--:--",
      Ogle: todayData?.times?.ogle || "--:--",
      Ikindi: todayData?.times?.ikindi || "--:--",
      Aksam: todayData?.times?.aksam || "--:--",
      Yatsi: todayData?.times?.yatsi || "--:--",
    };
  };

  return {
    times: getTodayTimesObj(),
    monthlyTimes: times,
    loading,
    nextPrayer,
    hijriDate,
  };
};
