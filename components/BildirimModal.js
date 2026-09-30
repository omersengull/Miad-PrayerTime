// components/BildirimModal.js
import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/prayers";
import CustomBildirimModal from "./CustomBildirimModal";

export default function BildirimModal({ visible, onClose, vakit }) {
  const [aktif, setAktif] = useState(false);
  const [sure, setSure] = useState(0);
  const [customBildirimModal, setCustomBildirimModal] = useState(false);
  
  const SURELER = [
    { label: "Tam Vaktinde", value: 0 },
    { label: "15 Dk Önce", value: 15 },
    { label: "30 Dk Önce", value: 30 },
    { label: "45 Dk Önce", value: 45 },
    { label: "1 Saat Önce", value: 60 },
  ];

  useEffect(() => {
    const veriOku = async () => {
      if (!vakit) return;
      const vakitVeri = await AsyncStorage.getItem(`bildirim_${vakit.key}`);
      if (vakitVeri) {
        const bildirimVeri = JSON.parse(vakitVeri);
        setAktif(bildirimVeri.aktif);
        setSure(bildirimVeri.sure);
      } else {
        setAktif(false);
        setSure(0);
      }
    };
    veriOku();
  }, [visible, vakit]);


  const ayarlariKaydet = async (yeniAktif, yeniSure) => {
    setAktif(yeniAktif);
    setSure(yeniSure);
    
    await AsyncStorage.setItem(`bildirim_${vakit.key}`, JSON.stringify({
      aktif: yeniAktif,
      sure: yeniSure
    }));
  };

  if (!vakit) return null;

  
  const isCustomSure = !SURELER.find(item => item.value === sure);

  // Butonun üzerinde "Özel" yerine girilen süreyi şıkça yazdıralım
  const getCustomButtonText = () => {
    if (!isCustomSure || sure === 0) return "Özel";
    const h = Math.floor(sure / 60);
    const m = sure % 60;
    if (h > 0 && m > 0) return `Özel - ${h}sa ${m}dk Önce`;
    if (h > 0) return `Özel - ${h} Saat Önce`;
    return `Özel - ${m} Dk Önce`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{vakit.label} BİLDİRİMİ</Text>
              <Text style={styles.subtitle}>Hatırlatıcı Ayarları</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name={aktif ? "bell-ring" : "bell-off"}
                size={24}
                color={aktif ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={styles.settingTitle}>Bildirimleri Aç</Text>
            </View>

            <Switch
              trackColor={{ false: "rgba(255,255,255,0.1)", true: COLORS.primary }}
              thumbColor={"#fff"}
              value={aktif}
              onValueChange={(val) => ayarlariKaydet(val, sure)}
            />
          </View>

          {aktif && (
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsTitle}>Ne zaman hatırlatılsın?</Text>
              <View style={styles.grid}>
                {SURELER.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.optionBtn, !isCustomSure && sure === item.value && styles.optionBtnActive]}
                    onPress={() => ayarlariKaydet(aktif, item.value)}
                  >
                    <Text style={[styles.optionText, !isCustomSure && sure === item.value && styles.optionTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                
        
                <TouchableOpacity
                  style={[styles.optionBtn, isCustomSure && sure > 0 && styles.optionBtnActive]}
                  onPress={() => setCustomBildirimModal(true)}
                >
                  <Text style={[styles.optionText, isCustomSure && sure > 0 && styles.optionTextActive ]}>
                    {getCustomButtonText()}
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          )}
        </View>
      </View>

   
      <CustomBildirimModal 
        visible={customBildirimModal} 
        onClose={() => setCustomBildirimModal(false)} 
        onSave={(gelenDakika) => ayarlariKaydet(aktif, gelenDakika)}
        mevcutSure={isCustomSure ? sure : 0} 
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#0f172a", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: 350, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  title: { color: COLORS.primary, fontSize: 18, fontWeight: "bold" },
  subtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  closeBtn: { padding: 5, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 16, marginBottom: 20 },
  settingLeft: { flexDirection: "row", alignItems: "center" },
  settingTitle: { color: COLORS.text, fontSize: 16, fontWeight: "600", marginLeft: 15 },
  optionsContainer: { padding: 5 },
  optionsTitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  optionBtn: { width: "48%", backgroundColor: "rgba(255,255,255,0.05)", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginBottom: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  optionBtnActive: { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: COLORS.primary },
  optionText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  optionTextActive: { color: COLORS.primary, fontWeight: "bold" },
});
