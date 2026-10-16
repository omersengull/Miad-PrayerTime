// hooks/usePrayerTimes.js
import { useState, useEffect } from "react";
import { AppState } from "react-native";
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

    // Uygulama arka plandan (background) öne döndüğünde otomatik veriyi tazele (Ay değişimi için)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        fetchMonthlyTimes(districtId).then((data) => {
          if (isMounted && data && data.length > 0) setTimes(data);
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [districtId]);

  const pad = (n) => String(n).padStart(2, "0");

  const getTodayTimesObj = () => {
    if (!times) return null;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    let todayData = times.find((d) => d.date && d.date.startsWith(todayStr));

    // Güvenlik amaçlı fallback
    if (!todayData) {
      const dayIndex = now.getDate() - 1;
      todayData =
        times.length > dayIndex ? times[dayIndex] : times[times.length - 1];
    }

    return {
      Imsak: todayData?.times?.imsak || "--:--",
      Gunes: todayData?.times?.gunes || "--:--",
      Ogle: todayData?.times?.ogle || "--:--",
      Ikindi: todayData?.times?.ikindi || "--:--",
      Aksam: todayData?.times?.aksam || "--:--",
      Yatsi: todayData?.times?.yatsi || "--:--",
    };
  };

  useEffect(() => {
    if (!times || times.length === 0) return;

    const sonGuncellenenHedef = { key: null };

    const timer = setInterval(() => {
      const now = new Date();

      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      let todayData = times.find((d) => d.date && d.date.startsWith(todayStr));

      if (!todayData) {
        const dayIndex = now.getDate() - 1;
        todayData =
          times.length > dayIndex ? times[dayIndex] : times[times.length - 1];
      }

      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
      let tomorrowData = times.find(
        (d) => d.date && d.date.startsWith(tomorrowStr),
      );

      if (!tomorrowData) {
        const tmrIndex = tomorrow.getDate() - 1;
        tomorrowData = times.length > tmrIndex ? times[tmrIndex] : times[0];
      }

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

      // Gece 12'yi geçmiş ve sonraki günün imsağı bekleniyorsa
      if (!upcomingPrayer) {
        const timeStr = tomorrowData?.times?.imsak || "00:00";
        const [hours, minutes] = timeStr.split(":");
        upcomingPrayer = PRAYERS[0];
        upcomingTimeObj = new Date(
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          tomorrow.getDate(),
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
          remaining: `${pad(h)}:${pad(m)}:${pad(s)}`,
          progress: progressVal,
        });

        // Sabit bildirimleri güncelle
        const hedefAnahtar = `${upcomingPrayer.key}_${upcomingTimeObj.getTime()}`;
        if (sonGuncellenenHedef.key !== hedefAnahtar) {
          sonGuncellenenHedef.key = hedefAnahtar;
          sabitBildirimiGuncelle(
            times,
            getTodayTimesObj(),
            activePrayer?.key || "yatsi",
          );
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [times]);

  return {
    times: getTodayTimesObj(),
    monthlyTimes: times,
    loading,
    nextPrayer,
    hijriDate,
  };
};
