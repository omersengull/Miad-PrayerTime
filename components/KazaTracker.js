import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/prayers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react"; // useEffect'i de ekle
const KAZA_VAKITLERI = [
  { key: "sabah", label: "SABAH", icon: "weather-sunset-up" },
  { key: "ogle", label: "ÖĞLE", icon: "weather-sunny" },
  { key: "ikindi", label: "İKİNDİ", icon: "weather-partly-cloudy" },
  { key: "aksam", label: "AKŞAM", icon: "weather-sunset-down" },
  { key: "yatsi", label: "YATSI", icon: "mosque" },
  { key: "vitr", label: "VİTİR", icon: "moon-waning-crescent" },
];

export default function KazaTracker() {
  const [kazaCounts, setKazaCounts] = useState({
    sabah: 0,
    ogle: 0,
    ikindi: 0,
    aksam: 0,
    yatsi: 0,
    vitr: 0,
  });

  useEffect(() => {
    const verileriYukle = async () => {
      const kazaNamazlari = await AsyncStorage.getItem("kaza_namazlari");
      if (kazaNamazlari) {
        setKazaCounts(JSON.parse(kazaNamazlari));
      }
    };
    verileriYukle();
  }, []);

  useEffect(() => {
    const verileriKaydet = async () => {
      await AsyncStorage.setItem("kaza_namazlari", JSON.stringify(kazaCounts));
    };
    verileriKaydet();
  }, [kazaCounts]);

  const handleIncrease = (vakitKey) => {
    setKazaCounts((prevCounts) => ({
      ...prevCounts,
      [vakitKey]: prevCounts[vakitKey] + 1,
    }));
  };

  // TODO 3: Bir vakti 1 azaltan fonksiyonu yaz.
  const handleDecrease = (vakitKey) => {
    setKazaCounts((prevCounts) => ({
      ...prevCounts,
      [vakitKey]: Math.max(0, prevCounts[vakitKey] - 1),
    }));
  };

  const handleResetAll = () => {
    Alert.alert(
      "Uyarı",
      "Tüm kaza namazı kayıtlarını sıfırlamak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Evet, Sıfırla", 
          style: "destructive", // iOS'te yazıyı kırmızı yapar
          onPress: () => {
            setKazaCounts({
              sabah: 0, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0, vitr: 0,
            });
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.pageTitle}>Kaza Namazı Takibi</Text>

      {KAZA_VAKITLERI.map((vakit) => (
        <View key={vakit.key} style={styles.card}>
          <View style={styles.leftContent}>
            <MaterialCommunityIcons
              name={vakit.icon}
              size={24}
              color={COLORS.textMuted}
            />
            <Text style={styles.label}>{vakit.label}</Text>
          </View>

          <View style={styles.rightContent}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDecrease(vakit.key)} // EKSİ BUTONU TIKLAMASI
            >
              <MaterialCommunityIcons
                name="minus"
                size={20}
                color={COLORS.text}
              />
            </TouchableOpacity>

            <Text style={styles.countText}>{kazaCounts[vakit.key]}</Text>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => handleIncrease(vakit.key)} // ARTI BUTONU TIKLAMASI
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity
        onPress={handleResetAll}
        activeOpacity={0.7}
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.55)", // Hafif kırmızı saydam arka plan
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(239, 68, 68, 0.3)", // Zarif kırmızı kenarlık
          marginTop: 16,
        }}
      >
        <Text
          style={{
            color: "#FFFF", // Yazıyı da uyumlu kırmızı yapmak butonun 'sıfırlama/tehlike' hissini güçlendirir
            fontSize: 14,
            fontWeight: "700",
            letterSpacing: 0.8,
          }}
        >
          TÜMÜNÜ SIFIRLA
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---- BURADAN AŞAĞISI SADECE TASARIM (DOKUNMANA GEREK YOK) ----
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  pageTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  leftContent: { flexDirection: "row", alignItems: "center" },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 15,
  },
  rightContent: { flexDirection: "row", alignItems: "center" },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: "center",
  },
});
