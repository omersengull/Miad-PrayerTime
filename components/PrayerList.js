import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRAYERS, COLORS } from '../constants/prayers';

export default function PrayerList({ times, activeKey }) {
  if (!times) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {PRAYERS.map((prayer) => {
          const isActive = prayer.key === activeKey;
          
          return (
            <View key={prayer.key} style={[styles.row, isActive && styles.activeRow]}>
              <View style={styles.leftContent}>
                <MaterialCommunityIcons name={prayer.icon} size={22} color={isActive ? COLORS.text : COLORS.textMuted} />
                <Text style={[styles.label, isActive && styles.activeText]}>{prayer.label}</Text>
              </View>
              
              <View style={styles.rightContent}>
                <Text style={[styles.timeText, isActive && styles.activeText]}>
                  {times[prayer.key] || '--:--'}
                </Text>
                <MaterialCommunityIcons name="bell-ring" size={18} color={isActive ? COLORS.text : COLORS.textMuted} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
 wrapper: {
    marginHorizontal: 20, borderRadius: 24, overflow: 'hidden',
    // 0.65 olan şeffaflığı 0.95 (neredeyse tamamen mat lacivert) yaptık:
    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  container: { paddingVertical: 10, paddingHorizontal: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 16, marginVertical: 2 },
  activeRow: { backgroundColor: COLORS.surfaceActive },
  leftContent: { flexDirection: 'row', alignItems: 'center' },
  label: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginLeft: 15 },
  rightContent: { flexDirection: 'row', alignItems: 'center' },
  timeText: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginRight: 15 },
  activeText: { color: '#ffffff' },
});