import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GununIcerigi from "./components/GununIcerigi";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import { useAutoLocation } from "./hooks/useAutoLocation";
import { COLORS, PRAYERS } from "./constants/prayers";
import PrayerDial from "./components/PrayerDial";
import PrayerList from "./components/PrayerList";
import BottomBar from "./components/BottomBar";
import LocationModal from "./components/LocationModal";
import KazaTracker from "./components/KazaTracker";
import Zikirmatik from "./components/Zikirmatik";
import KiblePusulasi from "./components/KiblePusulasi";
import DiniGunler from "./components/DiniGunler";
import MenuModal from "./components/MenuModal";
import BildirimModal from "./components/BildirimModal";
import {
  bildirimIzniniAl,
  eskiBildirimleriTemizle,
  bildirimKur,
  pilOptimizasyonunuKontrolEt,
} from "./services/notificationEngine";

const BG_IMAGE = require("./assets/images/background.webp");

export default function App() {
  const { location, setLocation, isLocating, findMyLocation } =
    useAutoLocation();

  const [secilenVakit, setSecilenVakit] = useState(null);
  const [bildirimModalVisible, setBildirimModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Anasayfa");
  const [showUI, setShowUI] = useState(false);
  const [alarmDurumlari, setAlarmDurumlari] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {
    times,
    loading: timesLoading,
    nextPrayer,
    hijriDate,
    monthlyTimes,
  } = usePrayerTimes(location.id);

  // GÖRSEL AÇILIŞ ANİMASYONU
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUI(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // ALARMLARI KURAN ANA MOTOR
  const alarmlariKurVeGuncelle = async (guncelDurumlar) => {
    const izinVarMi = await bildirimIzniniAl();
    if (!izinVarMi) return;

    await eskiBildirimleriTemizle();
    if (!times) return;

    for (const p of PRAYERS) {
      const vakitAnahtari = p.key;
      const alarmAcikMi = guncelDurumlar[vakitAnahtari];

      if (alarmAcikMi) {
        const kayit = await AsyncStorage.getItem(`bildirim_${vakitAnahtari}`);
        const sure = kayit ? JSON.parse(kayit).sure : 0;
        const vakitSaati = times[vakitAnahtari];
        await bildirimKur(p.label, vakitSaati, sure);
      }
    }
  };

  const alarmlariYukle = async () => {
    try {
      const keys = PRAYERS.map((p) => `bildirim_${p.key}`);
      const stores = await AsyncStorage.multiGet(keys);
      let durumlar = {};
      stores.forEach(([key, value]) => {
        const vakitKey = key.replace("bildirim_", "");
        durumlar[vakitKey] = value ? JSON.parse(value).aktif : false;
      });
      setAlarmDurumlari(durumlar);
      alarmlariKurVeGuncelle(durumlar);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (times) {
      alarmlariYukle();
      pilOptimizasyonunuKontrolEt(); 
    }
  }, [bildirimModalVisible, times !== null]);

  const handleBellPress = (gelenVakit) => {
    setSecilenVakit(gelenVakit);
    setBildirimModalVisible(true);
  };

  const getDynamicDates = () => {
    const now = new Date();
    const miladi = now.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${miladi}${hijriDate ? ` | ${hijriDate}` : ""}`;
  };

  const isLoadingAll = isLocating || timesLoading;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ImageBackground
        source={BG_IMAGE}
        style={styles.background}
        resizeMode="cover"
        backgroundColor="#060c17"
        blurRadius={showUI ? 4 : 0}
      >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />

        {showUI && (
          <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.glassBtn}
                  onPress={() => findMyLocation(true)}
                >
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={20}
                    color={COLORS.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.glassLocation}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.locationText} numberOfLines={1}>
                    {location.name}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.glassBtn}
                  onPress={() => setMenuVisible(true)}
                >
                  <MaterialCommunityIcons
                    name="menu"
                    size={24}
                    color={COLORS.text}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{getDynamicDates()}</Text>
              </View>

              <View style={styles.contentContainer}>
                {activeTab === "Anasayfa" ? (
                  isLoadingAll ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={styles.loadingText}>
                        Veriler Yükleniyor...
                      </Text>
                    </View>
                  ) : times ? (
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 150 }}
                    >
                      <PrayerDial
                        nextPrayerName={nextPrayer.label}
                        timeRemaining={nextPrayer.remaining}
                        progress={nextPrayer.progress}
                      />
                      <View style={styles.listContainer}>
                        <PrayerList
                          times={times}
                          onBellPress={handleBellPress}
                          activeKey={nextPrayer.activeKey}
                          alarmDurumlari={alarmDurumlari}
                        />
                      </View>
                      <GununIcerigi />
                    </ScrollView>
                  ) : (
                    <View style={styles.errorContainer}>
                      <MaterialCommunityIcons
                        name="wifi-off"
                        size={48}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.errorText}>
                        Vakitler alınamadı. İnternet bağlantınızı kontrol
                        ediniz.
                      </Text>
                    </View>
                  )
                ) : activeTab === "Kaza" ? (
                  <KazaTracker />
                ) : activeTab === "Kıble" ? (
                  <KiblePusulasi />
                ) : activeTab === "Zikir" ? (
                  <Zikirmatik />
                ) : activeTab === "Takvim" ? (
                  <DiniGunler />
                ) : null}
              </View>

              <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
            </SafeAreaView>
          </Animated.View>
        )}
      </ImageBackground>

      <LocationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={(loc) => setLocation(loc)}
      />
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        monthlyTimes={monthlyTimes}
      />
      <BildirimModal
        visible={bildirimModalVisible}
        onClose={() => setBildirimModalVisible(false)}
        vakit={secilenVakit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060c17" },
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 12, 23, 0.85)",
  },
  safeArea: { flex: 1, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  glassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  glassLocation: {
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  locationText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 5,
  },
  dateContainer: {
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dateText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.9,
    textAlign: "center",
  },
  contentContainer: { flex: 1, justifyContent: "flex-start", width: "100%" },
  listContainer: { width: "100%", paddingBottom: 0, marginBottom: 5 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: COLORS.textMuted, marginTop: 15, fontSize: 14 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 15,
    fontSize: 15,
    lineHeight: 22,
  },
});
