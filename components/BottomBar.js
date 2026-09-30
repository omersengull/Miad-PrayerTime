// components/BottomBar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/prayers';

export default function BottomBar({ activeTab, setActiveTab }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Anasayfa')}>
          <MaterialCommunityIcons name="home-variant" size={24} color={activeTab === 'Anasayfa' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Anasayfa' ? COLORS.primary : COLORS.textMuted }]}>ANASAYFA</Text>
          {activeTab === 'Anasayfa' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Kaza')}>
          <MaterialCommunityIcons name="calendar-check" size={22} color={activeTab === 'Kaza' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Kaza' ? COLORS.primary : COLORS.textMuted }]}>KAZA</Text>
          {activeTab === 'Kaza' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Kıble')}>
          <MaterialCommunityIcons name="compass" size={22} color={activeTab === 'Kıble' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Kıble' ? COLORS.primary : COLORS.textMuted }]}>KIBLE</Text>
          {activeTab === 'Kıble' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Zikir')}>
          <MaterialCommunityIcons name="necklace" size={22} color={activeTab === 'Zikir' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Zikir' ? COLORS.primary : COLORS.textMuted }]}>ZİKİR</Text>
          {activeTab === 'Zikir' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Takvim')}>
          <MaterialCommunityIcons name="calendar-star" size={22} color={activeTab === 'Takvim' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.label, { color: activeTab === 'Takvim' ? COLORS.primary : COLORS.textMuted }]}>TAKVİM</Text>
          {activeTab === 'Takvim' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    position: 'absolute', bottom: 20, left: 15, right: 15, 
    borderRadius: 25, overflow: 'hidden', 
    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' 
  },
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 8, fontWeight: '700', marginTop: 4 },
  activeIndicator: { width: 20, height: 3, backgroundColor: COLORS.primary, position: 'absolute', top: -10, borderRadius: 2 },
});
