// components/PrayerDial.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/prayers';

export default function PrayerDial({ nextPrayerName, timeRemaining }) {
  const size = 230; // Çember boyutu
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * 0.35); 

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      
      {/* 1. SVG Arka Plana Sabitleniyor */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size}>
         {/* Ortadaki Sayacın Arka Plan Çemberi */}
        <Circle 
          stroke="rgba(255, 255, 255, 0.05)" 
          // 0.3 olan şeffaflığı 0.9 yaptık, artık arkasını daha az gösterecek:
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
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </View>
      
      {/* 2. Yazılar Doğal Akışında Tam Merkeze Oturuyor */}
      <Text style={styles.title}>{nextPrayerName || 'BEKLENİYOR'} VAKTİNE</Text>
      <Text style={styles.time}>{timeRemaining}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    alignSelf: 'center', 
    justifyContent: 'center', // İçeriği dikeyde tam ortalar
    alignItems: 'center',     // İçeriği yatayda tam ortalar
    marginVertical: 15,       // Çemberin altı ve üstü için nefes boşluğu
  },
  title: { 
    color: COLORS.text, 
    fontSize: 13, 
    fontWeight: '600', 
    letterSpacing: 1, 
    marginBottom: 5 
  },
  time: { 
    color: COLORS.text, 
    fontSize: 42, // Ekrana daha iyi oturması için bir tık küçültüldü
    fontWeight: 'bold' 
  },
  subtitle: { 
    color: COLORS.textMuted, 
    fontSize: 11, 
    marginTop: 5 
  },
});