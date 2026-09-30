// components/PrayerDial.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/prayers';

export default function PrayerDial({ nextPrayerName, timeRemaining, progress = 1 }) {
  const size = 230; 
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // DİNAMİK ORAN: Progress 1 ise (Vakit yeni başladıysa) çember tam dolu, sıfıra yaklaştıkça eriyecek.
  const strokeDashoffset = circumference - (circumference * progress); 

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      
      <View style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size}>
          <Circle 
            stroke="rgba(255, 255, 255, 0.05)" 
            fill="rgba(15, 23, 42, 0.9)"
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            strokeWidth={strokeWidth} 
          />
          <Circle
            stroke={COLORS.primary}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset} // Dinamik değer buraya verildi
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </View>
      
      <Text style={styles.title}>{nextPrayerName || 'BEKLENİYOR'} VAKTİNE</Text>
      <Text style={styles.time}>{timeRemaining}</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  title: { color: COLORS.text, fontSize: 13, fontWeight: '600', letterSpacing: 1.5, marginBottom: 5 },
  time: { color: COLORS.text, fontSize: 48, fontWeight: 'bold' },
});
