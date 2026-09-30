// components/AylikImsakiye.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, SafeAreaView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/prayers";

export default function AylikImsakiye({ monthlyTimes, visible, onClose }) {
  if (!monthlyTimes || monthlyTimes.length === 0) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          
          {/* Üst Kısım: Başlık ve Kapatma Butonu */}
          <View style={styles.header}>
            <Text style={styles.title}>30 Günlük İmsakiye</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Tablo Başlıkları */}
          <View style={styles.tableHeader}>
            {/* Tarih sütununu genişlettik (flex: 2.5) ve sola yasladık */}
            <Text style={[styles.headerText, { flex: 2.5, textAlign: 'left', paddingLeft: 5 }]}>Tarih</Text>
            <Text style={styles.headerText}>İmsak</Text>
            <Text style={styles.headerText}>Güneş</Text>
            <Text style={styles.headerText}>Öğle</Text>
            <Text style={styles.headerText}>İkindi</Text>
            <Text style={styles.headerText}>Akşam</Text>
            <Text style={styles.headerText}>Yatsı</Text>
          </View>

          {/* Scroll Edilebilir Tablo İçeriği */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {monthlyTimes.map((item, index) => {
              const dateObj = new Date(item.date);
              const formatliTarih = dateObj.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
              
              // KESİN ÇÖZÜM: Yılı attık, sadece gün ve ay ismini aldık (Örn: "19 Rebiulevvel")
              const hicriKisa = `${item.hijri_date.day} ${item.hijri_date.month_name}`;

              return (
                <View key={index} style={styles.tableRow}>
                  {/* Tarih Kısmı (Genişletildi ve Taşma Koruması Eklendi) */}
                  <View style={{ flex: 2.5, paddingLeft: 5, paddingRight: 5, justifyContent: 'center' }}>
                    <Text style={styles.rowDate} numberOfLines={1} adjustsFontSizeToFit>{formatliTarih}</Text>
                    <Text style={styles.rowHijri} numberOfLines={1} adjustsFontSizeToFit>{hicriKisa}</Text>
                  </View>
                  
                  {/* Saatler */}
                  <Text style={styles.rowTime}>{item.times.imsak}</Text>
                  <Text style={styles.rowTime}>{item.times.gunes}</Text>
                  <Text style={styles.rowTime}>{item.times.ogle}</Text>
                  <Text style={styles.rowTime}>{item.times.ikindi}</Text>
                  <Text style={[styles.rowTime, { color: COLORS.primary }]}>{item.times.aksam}</Text>
                  <Text style={styles.rowTime}>{item.times.yatsi}</Text>
                </View>
              );
            })}
          </ScrollView>

        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  modalContainer: { flex: 1, backgroundColor: '#0f172a', marginTop: 50, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  title: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  closeBtn: { padding: 5 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.2)", paddingBottom: 10, marginBottom: 10 },
  headerText: { flex: 1, color: COLORS.textMuted, fontSize: 10, fontWeight: "bold", textAlign: "center" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  rowDate: { color: COLORS.text, fontSize: 12, fontWeight: "bold", textAlign: 'left' },
  rowHijri: { color: COLORS.textMuted, fontSize: 9, marginTop: 2, textAlign: 'left' },
  rowTime: { flex: 1, color: COLORS.text, fontSize: 11, fontWeight: "600", textAlign: "center" },
});
