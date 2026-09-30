import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from "expo-notifications";
import notifee from '@notifee/react-native';
import { COLORS } from '../constants/prayers';
import AylikImsakiye from './AylikImsakiye';

export default function MenuModal({ visible, onClose, monthlyTimes }) {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [imsakiyeVisible, setImsakiyeVisible] = useState(false);

  useEffect(() => {
    const ayariYukle = async () => {
      const ayar = await AsyncStorage.getItem('ayar_titresim');
      if (ayar !== null) setHapticsEnabled(JSON.parse(ayar));
    };
    if (visible) ayariYukle();
  }, [visible]);

const toggleHaptics = async (value) => {
  setHapticsEnabled(value);
  await AsyncStorage.setItem('ayar_titresim', value ? 'true' : 'false');
};

  const testBildirimiGonder = async () => {
    Alert.alert("Başarılı", "Uygulamayı arka plana alın. 5 saniye sonra bildirim gelecek.");
    await Notifications.scheduleNotificationAsync({
      content: { title: "🔔 Test Bildirimi", body: "Bildirim motoru kusursuz çalışıyor!", sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.menuContainer}>
          <View style={styles.dragIndicator} />

          <TouchableOpacity style={styles.menuButton} onPress={() => setImsakiyeVisible(true)}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="calendar-month" size={24} color={COLORS.primary} />
              <Text style={styles.menuText}>Aylık İmsakiye</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <View style={styles.menuButton}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="vibrate" size={24} color={COLORS.primary} />
              <Text style={styles.menuText}>Zikirmatik Titreşimi</Text>
            </View>
            <Switch trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primary }} thumbColor={"#fff"} value={hapticsEnabled} onValueChange={toggleHaptics} />
          </View>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuButton} onPress={() => notifee.openBatteryOptimizationSettings()}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="battery-off-outline" size={24} color={COLORS.primary} />
              <View style={{ marginLeft: 15 }}>
                <Text style={[styles.menuText, { marginLeft: 0 }]}>Pil Optimizasyonu</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>Alarmların çökmemesi için</Text>
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
