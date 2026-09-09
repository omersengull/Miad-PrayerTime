import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/prayers';

// activeTab ve setActiveTab proplarını App.js'ten alıyoruz
export default function BottomBar({ activeTab, setActiveTab }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Anasayfa')}>
          <MaterialCommunityIcons name="home-variant" size={26} color={activeTab === 'Anasayfa' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Anasayfa' ? COLORS.primary : COLORS.textMuted }]}>ANASAYFA</Text>
          {activeTab === 'Anasayfa' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Kaza')}>
          <MaterialCommunityIcons name="calendar-check" size={24} color={activeTab === 'Kaza' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Kaza' ? COLORS.primary : COLORS.textMuted }]}>KAZA</Text>
          {activeTab === 'Kaza' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Kıble')}>
          <MaterialCommunityIcons name="compass" size={24} color={activeTab === 'Kıble' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Kıble' ? COLORS.primary : COLORS.textMuted }]}>KIBLE</Text>
          {activeTab === 'Kıble' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Zikir')}>
          <MaterialCommunityIcons name="necklace" size={24} color={activeTab === 'Zikir' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Zikir' ? COLORS.primary : COLORS.textMuted }]}>ZİKİR</Text>
          {activeTab === 'Zikir' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 25, left: 20, right: 20, borderRadius: 30, overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  container: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12 },
  tab: { alignItems: 'center', justifyContent: 'center', width: 70 },
  label: { fontSize: 9, fontWeight: '700', marginTop: 4 },
  activeIndicator: { width: 25, height: 3, backgroundColor: COLORS.primary, position: 'absolute', top: -12, borderRadius: 2 },
});