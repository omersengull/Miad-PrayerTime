// components/LocationModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { fetchCities, fetchDistricts } from '../services/prayerApi';
import { COLORS } from '../constants/prayers';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LocationModal({ visible, onClose, onSelect }) {
  const [step, setStep] = useState(1);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const getId = (item) => item?.IlceID || item?.DistrictID || item?.Id || item?.id || item?.SehirID || item?.StateID || item?._id;
  const getName = (item) => item?.IlceAdi || item?.SehirAdi || item?.name_tr || item?.name || item?.Name || item?.DistrictName || item?.StateName;

  useEffect(() => {
    if (visible && step === 1 && cities.length === 0) {
      loadCities();
    }
  }, [visible]);

  const loadCities = async () => {
    setLoading(true);
    const data = await fetchCities();
    setCities(data);
    setLoading(false);
  };

  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    setStep(2);
    setLoading(true);
    const cityId = getId(city); 
    const data = await fetchDistricts(cityId);
    setDistricts(data);
    setLoading(false);
  };

  const handleDistrictSelect = (district) => {
    const districtId = getId(district);
    const cityName = getName(selectedCity);
    const districtName = getName(district);
    
    onSelect({
      id: districtId,
      name: `${cityName.toLocaleUpperCase('tr-TR')}, ${districtName}`
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCity(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            {step === 2 && (
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{step === 1 ? 'İl Seçin' : 'İlçe Seçin'}</Text>
            <View style={{ width: 24 }} /> 
          </View>

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={step === 1 ? cities : districts}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => step === 1 ? handleCitySelect(item) : handleDistrictSelect(item)}>
                  <Text style={styles.itemText}>{getName(item)}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'rgba(15, 23, 42, 0.95)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 5 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemText: { color: COLORS.text, fontSize: 16 },
  closeBtn: { marginTop: 20, paddingVertical: 15, backgroundColor: COLORS.surface, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
});