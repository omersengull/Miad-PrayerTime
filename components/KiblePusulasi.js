// components/KiblePusulasi.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { COLORS } from '../constants/prayers';

// Pusula kadranındaki 30 derecelik çentikler
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

export default function KiblePusulasi() {
  const [degree, setDegree] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. CİHAZIN KONUMUNU AL VE KIBLEYİ HESAPLA
  useEffect(() => {
    const calculateQibla = async () => {
      try {
        let location = await Location.getLastKnownPositionAsync({});
        if (!location) {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        }

        const userLat = location.coords.latitude;
        const userLon = location.coords.longitude;

        const kabeLat = 21.422487;
        const kabeLon = 39.826206;

        const toRad = (d) => (d * Math.PI) / 180;
        const toDeg = (r) => (r * 180) / Math.PI;

        const latK = toRad(kabeLat);
        const lonK = toRad(kabeLon);
        const latU = toRad(userLat);
        const lonU = toRad(userLon);

        const deltaLon = lonK - lonU;

        const y = Math.sin(deltaLon);
        const x = Math.cos(latU) * Math.tan(latK) - Math.sin(latU) * Math.cos(deltaLon);

        let qibla = toDeg(Math.atan2(y, x));
        qibla = (qibla + 360) % 360;

        setQiblaAngle(Math.round(qibla));
      } catch (error) {
        console.warn("Kıble hesaplanamadı", error);
      } finally {
        setLoading(false);
      }
    };

    calculateQibla();
  }, []);

  // 2. PUSULA SENSÖRÜ (TİTREME ENGELLEYİCİ FİLTRE İLE)
  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    let lastDegree = 0;
    
    const subscription = Magnetometer.addListener(data => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      angle = angle >= 0 ? angle : angle + 360;
      
      let deg = Math.round(angle) - 90;
      if (deg < 0) deg += 360;

      const diff = Math.abs(deg - lastDegree);
      if (diff >= 2 && diff < 358) {
        setDegree(deg);
        lastDegree = deg;
      }
    });

    return () => subscription.remove();
  }, []);

  const pusulaDonusu = 360 - degree; 
  
  let fark = qiblaAngle !== null ? Math.abs(degree - qiblaAngle) : 180;
  if (fark > 180) fark = 360 - fark;
  
  const isQibla = fark < 5;

  if (loading || qiblaAngle === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Kıble Yönü Hesaplanıyor...</Text>
      </View>
    );
  }

  const activeColor = isQibla ? COLORS.primary : '#ef4444';

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Kıble Pusulası</Text>
      
      <View style={styles.compassContainer}>
        
        {/* SABİT HEDEF OKU (ÜÇGEN NİŞANGAH) */}
        <View style={styles.targetPointerContainer}>
          <View style={[styles.targetTriangle, { borderBottomColor: activeColor }]} />
        </View>

        {/* DIŞ GÖLGE VE ÇERÇEVE */}
        <View style={[styles.outerGlow, isQibla && styles.outerGlowActive]}>
          
          {/* DÖNEN PUSULA DİSKİ */}
          <View style={[styles.compassCircle, { transform: [{ rotate: `${pusulaDonusu}deg` }] }]}>
            
            {/* KADRAN ÇENTİKLERİ */}
            {TICKS.map((angle) => {
              const isMain = angle % 90 === 0;
              return (
                <View
                  key={angle}
                  style={[
                    styles.tickWrapper,
                    { transform: [{ rotate: `${angle}deg` }] }
                  ]}
                >
                  <View style={[styles.tick, isMain && styles.tickMain]} />
                </View>
              );
            })}

            {/* İÇ HALKA (DERİNLİK İÇİN) */}
            <View style={styles.innerRing} />

            {/* YÖN İŞARETLERİ */}
            <Text style={styles.directionN}>N</Text>
            <Text style={styles.directionE}>E</Text>
            <Text style={styles.directionS}>S</Text>
            <Text style={styles.directionW}>W</Text>
            
            {/* KABE İKONU */}
            <View style={[styles.kabeWrapper, { transform: [{ rotate: `${qiblaAngle}deg` }] }]}>
              <View style={[styles.kabePin, isQibla && styles.kabePinActive]} />
              <View style={{ transform: [{ rotate: `-${qiblaAngle}deg` }] }}>
                <Text style={styles.kabeEmoji}>🕋</Text>
              </View>
            </View>

            {/* MERKEZ GÖBEK PİMİ */}
            <View style={styles.centerPinOuter}>
              <View style={[styles.centerPinInner, { backgroundColor: activeColor }]} />
            </View>

          </View>
        </View>

      </View>

      {/* DERECE VE BİLGİLENDİRME */}
      <View style={styles.degreeBox}>
        <Text style={[styles.degreeText, { color: activeColor }]}>
          {Math.round(degree)}°
        </Text>
        <Text style={styles.qiblaAngleInfo}>Kıble Açısı: {qiblaAngle}°</Text>
      </View>
      
      <View style={[styles.statusBadge, isQibla && styles.statusBadgeActive]}>
        <Text style={[styles.infoText, isQibla && styles.infoTextActive]}>
          {isQibla 
            ? "✓ Kıble Yönündesiniz!" 
            : "Telefonu yatay tutup oku Kabe'ye hizalayın"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10, alignItems: 'center' },
  pageTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', letterSpacing: 0.5, marginBottom: 40 },
  loadingText: { color: COLORS.textMuted, marginTop: 15, fontSize: 14 },
  
  compassContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Üstteki Sabit Üçgen Ok
  targetPointerContainer: {
    position: 'absolute',
    top: -2,
    zIndex: 20,
    alignItems: 'center',
  },
  targetTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }], // Ucu merkeze baksın
  },

  outerGlow: {
    width: 290,
    height: 290,
    borderRadius: 145,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlowActive: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },

  compassCircle: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(10, 17, 30, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Kadran Çentikleri
  tickWrapper: {
    position: 'absolute',
    width: 270,
    height: 270,
    alignItems: 'center',
  },
  tick: {
    width: 1.5,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tickMain: {
    width: 2.5,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },

  // İç Kadran Halkası
  innerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
  },

  // Yön Harfleri
  directionN: { position: 'absolute', top: 16, color: '#ef4444', fontWeight: '800', fontSize: 16 },
  directionS: { position: 'absolute', bottom: 16, color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
  directionE: { position: 'absolute', right: 18, color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
  directionW: { position: 'absolute', left: 18, color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
  
  // Kabe Katmanı
  kabeWrapper: {
    position: 'absolute',
    width: 270,
    height: 270,
    alignItems: 'center',
    paddingTop: 10,
  },
  kabePin: {
    width: 2,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 4,
    borderRadius: 1,
  },
  kabePinActive: {
    backgroundColor: COLORS.primary,
    height: 18,
  },
  kabeEmoji: {
    fontSize: 26,
  },

  // Merkez Göbek
  centerPinOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Metin & Durum
 // Metin & Durum Bölümü Güncellemesi
  degreeBox: {
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(6, 12, 23, 0.65)', // Yazı arkasına koyu şeffaf zemin
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  degreeText: { 
    fontSize: 40, 
    fontWeight: '800', 
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  qiblaAngleInfo: { 
    color: '#e2e8f0', // Sönük gri yerine açık/net beyazımsı gri
    fontSize: 13, 
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  
  statusBadge: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 22,
    backgroundColor: 'rgba(6, 12, 23, 0.75)', // Arka plan fotoğrafını kesen koyu zemin
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: '90%',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
  },
  infoText: { 
    color: '#f8fafc', // Tamamen okunabilir parlak beyaz
    fontSize: 13, 
    textAlign: 'center', 
    fontWeight: '600',
    lineHeight: 18,
  },
  infoTextActive: { 
    color: '#34d399', 
    fontWeight: '700' 
  },
});
