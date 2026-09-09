// App.js
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ImageBackground, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import KazaTracker from './components/KazaTracker'; 
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useAutoLocation } from './hooks/useAutoLocation';
import { COLORS } from './constants/prayers';
import PrayerDial from './components/PrayerDial';
import PrayerList from './components/PrayerList';
import BottomBar from './components/BottomBar';
import LocationModal from './components/LocationModal';

const BG_IMAGE = { uri: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=1080' };

export default function App() {
  const { location, setLocation, isLocating, findMyLocation } = useAutoLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const { times, loading: timesLoading, nextPrayer, hijriDate } = usePrayerTimes(location.id);
const [activeTab, setActiveTab] = useState('Anasayfa');
  // Arayüzün görünürlüğü ve animasyonu için State'ler
  const [showUI, setShowUI] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 0.4 Saniyelik Sinematik Açılış Efekti
  useEffect(() => {
    // Arka planda veriler yüklenirken (API ve GPS çalışmaya devam eder), arayüzü 400ms gizle.
    const timer = setTimeout(() => {
      setShowUI(true);
      // 400ms dolduğunda, arayüzü 0.5 saniye (500ms) içinde yavaşça belirginleştir
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, 
        useNativeDriver: true,
      }).start();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const getDynamicDates = () => {
    const now = new Date();
    const miladi = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `${miladi}${hijriDate ? ` | ${hijriDate}` : ''}`;
  };

  const isLoadingAll = isLocating || timesLoading;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* 
        blurRadius={4}: Resmi hafif bulanıklaştırıp dikkati arayüze odaklar.
      */}
      <ImageBackground 
        source={BG_IMAGE} 
        style={styles.background} 
        resizeMode="cover" 
        backgroundColor="#060c17"
        blurRadius={4} 
      >
        {/* Karartma filtresi 0.65'ten 0.85'e çıkarıldı. Resim artık daha karanlık ve geri planda. */}
        <View style={styles.overlay} />

        {/* showUI false olduğu sürece (ilk 0.4s) sadece resim görünür, arayüz gizlidir */}
        {showUI && (
          <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
            <SafeAreaView style={styles.safeArea}>
              
              <View style={styles.header}>
                <TouchableOpacity style={styles.glassBtn} onPress={() => findMyLocation(true)}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.glassLocation} onPress={() => setModalVisible(true)}>
                  <Text style={styles.locationText} numberOfLines={1}>{location.name}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.glassBtn}>
                  <MaterialCommunityIcons name="cog" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{getDynamicDates()}</Text>
              </View>

             <View style={styles.contentContainer}>
            {activeTab === 'Anasayfa' ? (
              // ANASAYFA EKRANI İÇERİĞİ
              isLoadingAll ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Veriler Yükleniyor...</Text>
                </View>
              ) : times ? (
                <>
                  <PrayerDial nextPrayerName={nextPrayer.label} timeRemaining={nextPrayer.remaining} />
                  <View style={styles.listContainer}>
                    <PrayerList times={times} activeKey={nextPrayer.activeKey} />
                  </View>
                </>
              ) : (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="wifi-off" size={48} color={COLORS.textMuted} />
                  <Text style={styles.errorText}>Vakitler alınamadı. İnternet bağlantınızı kontrol ediniz.</Text>
                </View>
              )
            ) : activeTab === 'Kaza' ? (
              // KAZA NAMAZI EKRANI İÇERİĞİ
              <KazaTracker />
            ) : (
              // DİĞER EKRANLAR (Kıble, Zikir) YAPILANA KADAR BOŞ DURACAK
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Bu sayfa yapım aşamasında...</Text>
              </View>
            )}
          </View>

           <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />

            </SafeAreaView>
          </Animated.View>
        )}
      </ImageBackground>

      <LocationModal visible={modalVisible} onClose={() => setModalVisible(false)} onSelect={(loc) => setLocation(loc)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060c17' },
  background: { flex: 1, width: '100%', height: '100%' },
  // Opaklık artırıldı (0.85). UI elemanları artık resmin üzerinde çok daha net patlayacak (görünecek).
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 12, 23, 0.85)' },
  safeArea: { flex: 1, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 5 },
  
  glassBtn: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  glassLocation: { 
    flex: 1, marginHorizontal: 15, borderRadius: 20, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    paddingVertical: 10, paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  locationText: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginRight: 5 },
  dateContainer: { alignItems: 'center', marginBottom: 10, paddingHorizontal: 10 },
  dateText: { color: COLORS.text, fontSize: 12, fontWeight: '400', opacity: 0.9, textAlign: 'center' },
  contentContainer: { flex: 1, justifyContent: 'flex-start', width: '100%' },
  listContainer: { width: '100%', paddingBottom: 100 }, 
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textMuted, marginTop: 15, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  errorText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 15, fontSize: 15, lineHeight: 22 },
});