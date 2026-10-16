import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import notifee from '@notifee/react-native';
import { COLORS } from '../constants/prayers';
import AylikImsakiye from './AylikImsakiye';
import { sabitBildirimiBaslat, sabitBildirimiDurdur } from '../services/notificationEngine';

export default function MenuModal({ visible, onClose, monthlyTimes }) {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [sabitBildirimEnabled, setSabitBildirimEnabled] = useState(true);
  const [imsakiyeVisible, setImsakiyeVisible] = useState(false);

  useEffect(() => {
    const ayariYukle = async () => {
      const ayar = await AsyncStorage.getItem('ayar_titresim');
      if (ayar !== null) setHapticsEnabled(JSON.parse(ayar));

      const bildirimAyar = await AsyncStorage.getItem('ayar_sabit_bildirim');
      if (bildirimAyar !== null) {
        setSabitBildirimEnabled(bildirimAyar !== 'false');
      } else {
        setSabitBildirimEnabled(true);
      }
    };
    if (visible) ayariYukle();
  }, [visible]);

  const toggleHaptics = async (value) => {
    setHapticsEnabled(value);
    await AsyncStorage.setItem('ayar_titresim', value ? 'true' : 'false');
  };

  const toggleSabitBildirim = async (value) => {
    setSabitBildirimEnabled(value);
    if (value) {
      let todayTimes = {};
      if (Array.isArray(monthlyTimes) && monthlyTimes.length > 0) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const todayData = monthlyTimes.find((d) => d.date && d.date.startsWith(todayStr)) || monthlyTimes[0];
        if (todayData?.times) {
          todayTimes = {
            Imsak: todayData.times.imsak || '--:--',
            Gunes: todayData.times.gunes || '--:--',
            Ogle: todayData.times.ogle || '--:--',
            Ikindi: todayData.times.ikindi || '--:--',
            Aksam: todayData.times.aksam || '--:--',
            Yatsi: todayData.times.yatsi || '--:--',
          };
        }
      }
      await sabitBildirimiBaslat(monthlyTimes, todayTimes, 'yatsi');
    } else {
      await sabitBildirimiDurdur();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.menuContainer}>
          <View style={styles.dragIndicator} />

          {/* Aylık İmsakiye */}
          <TouchableOpacity style={styles.menuButton} onPress={() => setImsakiyeVisible(true)}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="calendar-month" size={24} color={COLORS.primary} />
              <Text style={styles.menuText}>Aylık İmsakiye</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Sabit Bildirim ve Sayaç (Kalıcı Bildirim Aç/Kapat) */}
          <View style={styles.menuButton}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="clock-check-outline" size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 15 }}>
                <Text style={[styles.menuText, { marginLeft: 0 }]}>Sabit Bildirim ve Canlı Sayaç</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>Kilit ekranında ve bildirim panelinde kalıcı takip</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primary }}
              thumbColor={"#fff"}
              value={sabitBildirimEnabled}
              onValueChange={toggleSabitBildirim}
            />
          </View>
          <View style={styles.divider} />

          {/* Zikirmatik Titreşimi */}
          <View style={styles.menuButton}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="vibrate" size={24} color={COLORS.primary} />
              <Text style={styles.menuText}>Zikirmatik Titreşimi</Text>
            </View>
            <Switch
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primary }}
              thumbColor={"#fff"}
              value={hapticsEnabled}
              onValueChange={toggleHaptics}
            />
          </View>
          <View style={styles.divider} />

          {/* Pil Optimizasyonu */}
          <TouchableOpacity style={styles.menuButton} onPress={() => notifee.openBatteryOptimizationSettings()}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="battery-off-outline" size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 15 }}>
                <Text style={[styles.menuText, { marginLeft: 0 }]}>Pil Optimizasyonu</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>Alarmların çökmemesi için ayarlar</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

        </View>
      </View>

      <AylikImsakiye visible={imsakiyeVisible} onClose={() => setImsakiyeVisible(false)} monthlyTimes={monthlyTimes} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  menuContainer: { backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dragIndicator: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  menuButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginLeft: 15 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 5 },
});
