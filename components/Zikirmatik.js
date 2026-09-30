// components/Zikirmatik.js
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants/prayers";

export default function Zikirmatik() {
  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Titreşim ayarını ve sayacı yükle
  const ayarlarıVeSayacıYukle = async () => {
    try {
      const sayacVeri = await AsyncStorage.getItem("zikir_count");
      if (sayacVeri) setCount(JSON.parse(sayacVeri));
      
      const titresimVerisi = await AsyncStorage.getItem('ayar_titresim');
      // Sadece açıkça 'false' ise kapat, yoksa açık kalsın
      setHapticsEnabled(titresimVerisi !== 'false');

      setIsLoaded(true);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    ayarlarıVeSayacıYukle();
  }, []);

  // Sayacı kaydet
  useEffect(() => {
    const sayacKaydet = async () => {
      if (isLoaded) await AsyncStorage.setItem("zikir_count", JSON.stringify(count));
    };
    sayacKaydet();
  }, [count, isLoaded]);

  // Sayıyı 1 artıran fonksiyon
   const handlePress = async () => {
  // Ayarı her seferinde taze oku (menüden değiştirilmiş olabilir)
  const titresimVerisi = await AsyncStorage.getItem('ayar_titresim');
  const aktifMi = titresimVerisi !== 'false';

  setCount((prevCount) => {
    const newCount = prevCount + 1;

    if (aktifMi) {
      if (newCount % 33 === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    return newCount;
  });
};

  const handleReset = async () => {
  const titresimVerisi = await AsyncStorage.getItem('ayar_titresim');
  const aktifMi = titresimVerisi !== 'false';

  Alert.alert(
    "Sıfırla",
    "Zikir sayacını sıfırlamak istediğinize emin misiniz?",
    [
      { text: "İptal", style: "cancel" },
      {
        text: "Evet, Sıfırla",
        style: "destructive",
        onPress: () => {
          if (aktifMi) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          setCount(0);
        },
      },
    ],
  );
};

  const turSayisi = Math.floor(count / 33);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Zikirmatik</Text>

      {/* Ana Zikirmatik Kutusu */}
      <View style={styles.centerContainer}>
        
        {/* Dijital Ekran */}
        <View style={styles.digitalScreen}>
          <View style={styles.screenHeader}>
            <Text style={styles.screenLabel}>DİJİTAL SAYAÇ</Text>
            <Text style={styles.roundText}>TUR: {turSayisi}</Text>
          </View>
          <Text style={styles.countText}>{count}</Text>
        </View>

        {/* Gövde İçi Üst Buton Barı: Yalnızca Sıfırla Butonu */}
        <View style={styles.controlsRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity 
            style={styles.inlineResetBtn} 
            activeOpacity={0.7}
            onPress={handleReset}
          >
            <MaterialCommunityIcons name="refresh" size={16} color="#fda4af" />
            <Text style={styles.inlineResetText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* Ana Zikir Butonu */}
        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.75}
          onPress={handlePress}
        >
          <View style={styles.mainButtonInner}>
            <MaterialCommunityIcons
              name="fingerprint"
              size={60}
              color="#042f2e"
            />
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "center",
  },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 40,
  },
  centerContainer: {
    alignItems: "center",
    backgroundColor: "rgba(10, 17, 30, 0.85)",
    paddingVertical: 26,
    paddingHorizontal: 22,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    width: "100%",
    maxWidth: 340,
    elevation: 8,
  },
  digitalScreen: {
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 4,
  },
  screenLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  roundText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  countText: {
    color: "#34d399",
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: 3,
    fontVariant: ["tabular-nums"],
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    marginTop: 18,
    marginBottom: 20,
  },
  inlineResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 4,
  },
  inlineResetText: {
    color: "#fda4af",
    fontSize: 12,
    fontWeight: "700",
  },
  mainButton: {
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonInner: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
});
