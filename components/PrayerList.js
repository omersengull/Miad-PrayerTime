import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PRAYERS, COLORS } from "../constants/prayers";

export default function PrayerList({ onBellPress, times, activeKey, alarmDurumlari }) {
  if (!times) return null;

  const activeIndex = PRAYERS.findIndex((p) => p.key === activeKey);
  const nextPrayer = activeIndex !== -1 ? PRAYERS[(activeIndex + 1) % PRAYERS.length] : null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {PRAYERS.map((prayer) => {
          const isActive = prayer.key === activeKey;
          const isNext = nextPrayer?.key === prayer.key;
          const isAlarmOn = alarmDurumlari ? alarmDurumlari[prayer.key] : false;

          return (
            <View
              key={prayer.key}
              style={[styles.row, isActive && styles.activeRow]}
            >
              <View style={styles.leftContent}>
                <MaterialCommunityIcons
                  name={prayer.icon}
                  size={22}
                  color={isActive ? COLORS.text : COLORS.textMuted}
                />
                <Text style={[styles.label, isActive && styles.activeText]}>
                  {prayer.label}
                </Text>

                {isNext && (
                  <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>Sıradaki</Text>
                  </View>
                )}
              </View>

              <View style={styles.rightContent}>
                <Text style={[styles.timeText, isActive && styles.activeText]}>
                  {times[prayer.key] || "--:--"}
                </Text>
                <TouchableOpacity onPress={() => onBellPress(prayer)} style={{ padding: 5 }}>
                  <MaterialCommunityIcons
                    name={isAlarmOn ? "bell-ring" : "bell-outline"}
                    size={20}
                    color={isActive ? COLORS.text : (isAlarmOn ? COLORS.primary : COLORS.textMuted)}
                  />
                </TouchableOpacity>
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
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  container: { paddingVertical: 10, paddingHorizontal: 15 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginVertical: 1,
  },
  activeRow: { backgroundColor: COLORS.surfaceActive, borderRadius: 16 },
  leftContent: { flexDirection: "row", alignItems: "center" },
  label: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 15,
  },
  nextBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  nextBadgeText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  rightContent: { flexDirection: "row", alignItems: "center" },
  timeText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginRight: 15,
  },
  activeText: { color: "#ffffff" },
});
