// components/CustomBildirimModal.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/prayers";

export default function CustomBildirimModal({
  visible,
  onClose,
  onSave,
  mevcutSure,
}) {
  const [saat, setSaat] = useState("");
  const [dakika, setDakika] = useState("");

 
  useEffect(() => {
    if (visible) {
      if (mevcutSure > 0) {
        setSaat(Math.floor(mevcutSure / 60).toString());
        const dk = mevcutSure % 60;
        setDakika(dk === 0 ? "" : dk.toString());
      } else {
        setSaat("");
        setDakika("");
      }
    }
  }, [visible, mevcutSure]);

  const handleDakikaChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned === "") {
      setDakika("");
      return;
    }
    const num = parseInt(cleaned, 10);
    if (num > 59) {
      setDakika("59");
    } else {
      setDakika(cleaned);
    }
  };

  const handleSave = () => {
    const s = parseInt(saat, 10) || 0;
    const d = parseInt(dakika, 10) || 0;
    const toplamDakika = s * 60 + d;


    onSave(toplamDakika);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>ÖZEL SÜRE</Text>
              <Text style={styles.subtitle}>Ne kadar önce bildirilsin?</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.timeInputsWrapper}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={saat}
                onChangeText={(text) => setSaat(text.replace(/[^0-9]/g, ""))}
                maxLength={2}
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
                selectionColor={COLORS.primary}
              />
              <Text style={styles.inputLabel}>saat</Text>
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={dakika}
                onChangeText={handleDakikaChange}
                maxLength={2}
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
                selectionColor={COLORS.primary}
              />
              <Text style={styles.inputLabel}>dk</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.btnCancelText}>Vazgeç</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnConfirm]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.btnConfirmText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  subtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  closeBtn: {
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
  },
  timeInputsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    width: 65,
    height: 54,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.text,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  inputLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, width: "100%" },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnCancel: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
  btnConfirm: { backgroundColor: COLORS.primary },
  btnCancelText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 14 },
  btnConfirmText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
