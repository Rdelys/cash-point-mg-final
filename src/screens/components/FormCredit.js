import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function FormCredit({ title }) {
  const [amount, setAmount] = useState('1000');
  const [duration, setDuration] = useState('1');
  const [message, setMessage] = useState('');
  const [disponible, setDisponible] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rechargeInput, setRechargeInput] = useState('');
  const currentDate = new Date().toLocaleDateString();

  const storageKey = `disponible_${title.toLowerCase().replace(/\s+/g, '_')}`;

  useEffect(() => {
    getDisponible();
  }, []);

  const getDisponible = async () => {
    try {
      const value = await AsyncStorage.getItem(storageKey);
      setDisponible(value ? parseInt(value) : 0);
    } catch (err) {
      console.error('Erreur lecture crédit dispo :', err);
    }
  };

  const handleSubmit = async () => {
    const total = parseInt(amount) * parseInt(duration);

    if (total > disponible) {
      setMessage('❌ Crédit insuffisant.');
      return;
    }

    const newData = { title, amount, duration, date: currentDate };

    try {
      setIsSubmitting(true);

      // Ajout à l'historique des crédits
      const existing = await AsyncStorage.getItem('credits');
      const credits = existing ? JSON.parse(existing) : [];
      credits.push(newData);
      await AsyncStorage.setItem('credits', JSON.stringify(credits));

      // Mise à jour du crédit disponible
      const newDisponible = disponible - total;
      await AsyncStorage.setItem(storageKey, newDisponible.toString());
      setDisponible(newDisponible);

      setMessage('✅ Crédit ajouté.');
      setAmount('1000');
      setDuration('1');
    } catch (error) {
      console.error('Erreur ajout crédit :', error);
      setMessage("❌ Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRechargeConfirm = async () => {
    const amountToAdd = parseInt(rechargeInput);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      Alert.alert('Montant invalide', 'Veuillez entrer un nombre valide supérieur à zéro.');
      return;
    }

    const newTotal = disponible + amountToAdd;
    try {
      await AsyncStorage.setItem(storageKey, newTotal.toString());
      setDisponible(newTotal);

      // Ajout historique recharge avec date
      const historiqueEntry = {
        title,
        type: 'Recharge',
        amount: amountToAdd,
        date: currentDate,
      };
      const existingHistorique = await AsyncStorage.getItem('creditHistorique');
      const historique = existingHistorique ? JSON.parse(existingHistorique) : [];
      historique.push(historiqueEntry);
      await AsyncStorage.setItem('creditHistorique', JSON.stringify(historique));

      setMessage('✅ Crédit disponible mis à jour.');
    } catch (error) {
      console.error('Erreur mise à jour crédit dispo :', error);
      setMessage("❌ Erreur lors de la mise à jour du crédit.");
    }
    setRechargeInput('');
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>📅 {currentDate}</Text>
      <Text style={styles.credit}>💳 Disponible : {disponible} Ar</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.rechargeButton}
      >
        <Text style={styles.rechargeText}>➕ Ajouter Crédit Disponible</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Montant</Text>
      <Picker
        selectedValue={amount}
        onValueChange={setAmount}
        style={styles.input}
        itemStyle={{ fontSize: 12 }}
      >
        {['1000', '2000', '3000', '5000', '10000'].map((val) => (
          <Picker.Item key={val} label={val} value={val} />
        ))}
      </Picker>

      <Text style={styles.label}>Nombre</Text>
      <Picker
        selectedValue={duration}
        onValueChange={setDuration}
        style={styles.input}
        itemStyle={{ fontSize: 12 }}
      >
        {[...Array(10)].map((_, i) => (
          <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
        ))}
      </Picker>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={parseInt(amount) * parseInt(duration) > disponible || isSubmitting}
        style={[
          styles.button,
          (parseInt(amount) * parseInt(duration) > disponible || isSubmitting) &&
            styles.disabledButton,
        ]}
      >
        <Text style={styles.buttonText}>Soumettre</Text>
      </TouchableOpacity>

      {message !== '' && <Text style={styles.message}>{message}</Text>}

      {/* Modal de recharge */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Entrez le montant à ajouter</Text>
            <TextInput
              keyboardType="numeric"
              value={rechargeInput}
              onChangeText={setRechargeInput}
              style={styles.modalInput}
              placeholder="Montant en Ariary"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={handleRechargeConfirm}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.rechargeButton}
            >
              <Text style={styles.rechargeText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 15 },
  title: { color: '#00ffcc', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  date: { color: '#ccc', fontSize: 14, marginBottom: 8 },
  credit: { color: '#00ffcc', fontSize: 14, marginBottom: 15 },
  label: { color: '#fff', marginTop: 8, fontSize: 12 },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    marginTop: 5,
    height: 35,
    fontSize: 12,
  },
  button: {
    marginTop: 15,
    backgroundColor: '#00ffcc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  buttonText: { color: '#111', fontWeight: 'bold', fontSize: 14 },
  message: { marginTop: 12, color: '#0f0', fontSize: 12, textAlign: 'center' },
  rechargeButton: {
    marginBottom: 8,
    backgroundColor: '#444',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  rechargeText: {
    color: '#00ffcc',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    width: '80%',
  },
  modalInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    marginBottom: 15,
    fontSize: 12,
  },
});
