import React, { useState, useEffect } from "react";
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

const KAZA_VAKITLERI = [
  { key: "sabah", label: "Sabah", icon: "weather-sunset-up" },
  { key: "ogle", label: "Öğle", icon: "weather-sunny" },
  { key: "ikindi", label: "İkindi", icon: "weather-partly-cloudy" },
  { key: "aksam", label: "Akşam", icon: "weather-sunset-down" },
  { key: "yatsi", label: "Yatsı", icon: "mosque" },
  { key: "vitr", label: "Vitir", icon: "moon-waning-crescent" },
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

  const handleDecrease = (vakitKey) => {
    setKazaCounts((prevCounts) => ({
      ...prevCounts,
      [vakitKey]: Math.max(0, prevCounts[vakitKey] - 1),
    }));
  };

  const handleResetAll = () => {
    Alert.alert(
      "Sıfırla",
      "Tüm kaza namazı kayıtlarını sıfırlamak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet, Sıfırla",
          style: "destructive",
          onPress: () => {
            setKazaCounts({
              sabah: 0,
              ogle: 0,
              ikindi: 0,
              aksam: 0,
              yatsi: 0,
              vitr: 0,
            });
          },
        },
      ],
    );
  };

  const toplamKaza = Object.values(kazaCounts).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.pageTitle}>Kaza Namazı Takibi</Text>

      {/* Sadeleştirilmiş Toplam Kaza Kartı */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOPLAM KAZA BORCU</Text>
        <Text style={styles.summaryValue}>{toplamKaza}</Text>
      </View>

      {/* Vakit Kartları */}
      {KAZA_VAKITLERI.map((vakit) => {
        const count = kazaCounts[vakit.key] || 0;
        const hasKaza = count > 0;

        return (
          <View key={vakit.key} style={[styles.card, hasKaza && styles.cardActive]}>
            <View style={styles.leftContent}>
              <View style={[styles.iconWrapper, hasKaza && styles.iconWrapperActive]}>
                <MaterialCommunityIcons
                  name={vakit.icon}
                  size={22}
                  color={hasKaza ? COLORS.primary : "#94a3b8"}
                />
              </View>
              <Text style={styles.label}>{vakit.label}</Text>
            </View>

            <View style={styles.rightContent}>
              <TouchableOpacity
                style={[styles.actionBtn, count === 0 && styles.actionBtnDisabled]}
                onPress={() => handleDecrease(vakit.key)}
                activeOpacity={0.6}
                disabled={count === 0}
              >
                <MaterialCommunityIcons
                  name="minus"
                  size={18}
                  color={count === 0 ? "rgba(255,255,255,0.2)" : "#f8fafc"}
                />
              </TouchableOpacity>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPlus]}
                onPress={() => handleIncrease(vakit.key)}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#042f2e" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Yüksek Görünürlüklü Sıfırlama Butonu */}
      <TouchableOpacity
        onPress={handleResetAll}
        activeOpacity={0.75}
        style={styles.resetButton}
      >
        <MaterialCommunityIcons name="refresh" size={20} color="#ffffff" />
        <Text style={styles.resetButtonText}>TÜM KAYITLARI SIFIRLA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 130,
  },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: "center",
  },

  // Tekli Toplam Kaza Kartı
  summaryCard: {
    backgroundColor: "rgba(10, 17, 30, 0.85)",
    borderRadius: 20,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  summaryValue: {
    color: "#34d399",
    fontSize: 26,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  // Vakit Kartı
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(10, 17, 30, 0.82)",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardActive: {
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconWrapperActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  label: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Sayaç ve Butonlar
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  actionBtnPlus: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  countBadge: {
    minWidth: 46,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  // Belirgin Sıfırlama Butonu
  resetButton: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.85)", // Arka plandan net ayrışan opak kırmızı
    borderWidth: 1,
    borderColor: "#ef4444",
    marginTop: 16,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
});
