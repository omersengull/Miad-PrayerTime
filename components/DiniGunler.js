// components/DiniGunler.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/prayers";

const DINI_GUNLER_2026 = [
  { id: "1", isim: "Miraç Kandili", tarih: "15 Ocak 2026", gun: "Perşembe", type: "kandil" },
  { id: "2", isim: "Berat Kandili", tarih: "2 Şubat 2026", gun: "Pazartesi", type: "kandil" },
  { id: "3", isim: "Ramazan Başlangıcı", tarih: "19 Şubat 2026", gun: "Perşembe", type: "ramazan" },
  { id: "4", isim: "Kadir Gecesi", tarih: "16 Mart 2026", gun: "Pazartesi", type: "kandil" },
  { id: "5", isim: "Ramazan Bayramı Arifesi", tarih: "19 Mart 2026", gun: "Perşembe", type: "arife" },
  { id: "6", isim: "Ramazan Bayramı 1. Gün", tarih: "20 Mart 2026", gun: "Cuma", type: "bayram" },
  { id: "7", isim: "Ramazan Bayramı 2. Gün", tarih: "21 Mart 2026", gun: "Cumartesi", type: "bayram" },
  { id: "8", isim: "Ramazan Bayramı 3. Gün", tarih: "22 Mart 2026", gun: "Pazar", type: "bayram" },
  { id: "9", isim: "Kurban Bayramı Arifesi", tarih: "26 Mayıs 2026", gun: "Salı", type: "arife" },
  { id: "10", isim: "Kurban Bayramı 1. Gün", tarih: "27 Mayıs 2026", gun: "Çarşamba", type: "bayram" },
  { id: "11", isim: "Kurban Bayramı 2. Gün", tarih: "28 Mayıs 2026", gun: "Perşembe", type: "bayram" },
  { id: "12", isim: "Kurban Bayramı 3. Gün", tarih: "29 Mayıs 2026", gun: "Cuma", type: "bayram" },
  { id: "13", isim: "Kurban Bayramı 4. Gün", tarih: "30 Mayıs 2026", gun: "Cumartesi", type: "bayram" },
  { id: "14", isim: "Hicri Yılbaşı", tarih: "16 Haziran 2026", gun: "Salı", type: "ozel" },
  { id: "15", isim: "Aşure Günü", tarih: "25 Haziran 2026", gun: "Perşembe", type: "ozel" },
  { id: "16", isim: "Mevlid Kandili", tarih: "24 Ağustos 2026", gun: "Pazartesi", type: "kandil" },
  { id: "17", isim: "Regaib Kandili", tarih: "10 Aralık 2026", gun: "Perşembe", type: "kandil" },
];

export default function DiniGunler() {
  const getEventIcon = (type) => {
    switch (type) {
      case "bayram":
        return { name: "gift-outline", color: "#38bdf8" }; // Açık mavi
      case "ramazan":
        return { name: "mosque", color: COLORS.primary }; // Yeşil
      case "kandil":
        return { name: "star-crescent", color: "#fbbf24" }; // Altın sarısı
      case "arife":
        return { name: "clock-outline", color: "#f472b6" }; // Pembe
      default:
        return { name: "calendar-star", color: COLORS.primary };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerBox}>
        <Text style={styles.pageTitle}>2026 Dini Günler</Text>
      </View>

      {DINI_GUNLER_2026.map((item) => {
        const iconConfig = getEventIcon(item.type);
        const [gunSayi, ayIsim] = item.tarih.split(" ");

        return (
          <View key={item.id} style={styles.card}>
            {/* Sol Tarih Bloğu (Takvim yaprağı hissi) */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateDayNumber}>{gunSayi}</Text>
              <Text style={styles.dateMonthName}>{ayIsim.slice(0, 3).toUpperCase()}</Text>
            </View>

            {/* Orta Metin Alanı */}
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>{item.isim}</Text>
              <Text style={styles.dayOfWeekText}>{item.gun}</Text>
            </View>

            {/* Sağ Tür İkonu */}
            <View style={[styles.iconBadge, { backgroundColor: `${iconConfig.color}15` }]}>
              <MaterialCommunityIcons
                name={iconConfig.name}
                size={20}
                color={iconConfig.color}
              />
            </View>
          </View>
        );
      })}
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
  headerBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 17, 30, 0.82)", // Arka planı kesen net koyu zemin
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Sol Tarih Kutucuğu
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  dateDayNumber: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 20,
  },
  dateMonthName: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Orta Metin
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  dayOfWeekText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },

  // Sağ İkon
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
