import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function FormMobileMoney({ title }) {
  const [type, setType] = useState('Dépôt');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [soldeDisponible, setSoldeDisponible] = useState(0);

  // Modal solde
  const [modalVisible, setModalVisible] = useState(false);
  const [soldeInput, setSoldeInput] = useState('');
  const [modalType, setModalType] = useState('Dépôt');

  const currentDate = new Date().toLocaleDateString();
const getServiceKey = () => {
  if (title.includes('Airtel')) return 'airtel';
  if (title.toLowerCase().includes('mvola')) return 'mvola';
  if (title.toLowerCase().includes('orange')) return 'orange';
  return 'inconnu';
};

const storageKey = `solde_${getServiceKey()}`;

  useEffect(() => {
    loadSolde();
  }, []);

  const loadSolde = async () => {
    try {
      const value = await AsyncStorage.getItem(storageKey);
      setSoldeDisponible(value ? parseInt(value) : 0);
    } catch (error) {
      console.error('Erreur lecture solde:', error);
    }
  };

  const handleSubmit = async () => {
    if (!phone || !amount || !commission || !reference) {
      setMessage('⚠️ Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const montantNum = parseInt(amount);
    if (isNaN(montantNum) || montantNum <= 0) {
      setMessage('⚠️ Montant invalide.');
      return;
    }

    if (type === 'Retrait' && montantNum > soldeDisponible) {
      setMessage('❌ Solde insuffisant pour ce retrait.');
      return;
    }

    const newData = {
      title,
      type,
      name,
      phone,
      amount: montantNum,
      commission,
      reference,
      date: currentDate,
    };

    try {
      const existing = await AsyncStorage.getItem('mobileMoney');
      const records = existing ? JSON.parse(existing) : [];
      records.push(newData);
      await AsyncStorage.setItem('mobileMoney', JSON.stringify(records));

      let nouveauSolde = soldeDisponible;
      if (type === 'Dépôt') {
        nouveauSolde += montantNum;
      } else {
        nouveauSolde -= montantNum;
      }
      await AsyncStorage.setItem(storageKey, nouveauSolde.toString());
      setSoldeDisponible(nouveauSolde);

      // Ajout historique solde
      const historiqueEntry = {
        title,
        type,
        amount: montantNum,
        date: currentDate,
      };
      const existingHistorique = await AsyncStorage.getItem('soldeHistorique');
      const historique = existingHistorique ? JSON.parse(existingHistorique) : [];
      historique.push(historiqueEntry);
      await AsyncStorage.setItem('soldeHistorique', JSON.stringify(historique));

      setMessage('✅ Transaction ajoutée avec succès.');

      setName('');
      setPhone('');
      setAmount('');
      setCommission('');
      setReference('');
      setType('Dépôt');
    } catch (error) {
      console.error('Erreur sauvegarde MobileMoney:', error);
      setMessage('❌ Une erreur est survenue lors de la sauvegarde.');
    }
  };

  const handleSoldeConfirm = async () => {
    const val = parseInt(soldeInput);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Montant invalide', 'Veuillez entrer un nombre supérieur à zéro.');
      return;
    }

    let nouveauSolde = soldeDisponible;
    if (modalType === 'Dépôt') {
      nouveauSolde += val;
    } else {
      if (val > soldeDisponible) {
        Alert.alert('Solde insuffisant', 'Impossible de retirer plus que le solde disponible.');
        return;
      }
      nouveauSolde -= val;
    }

    try {
      await AsyncStorage.setItem(storageKey, nouveauSolde.toString());
      setSoldeDisponible(nouveauSolde);

      // Ajout historique solde
      const historiqueEntry = {
        title,
        type: modalType,
        amount: val,
        date: currentDate,
      };
      const existingHistorique = await AsyncStorage.getItem('soldeHistorique');
      const historique = existingHistorique ? JSON.parse(existingHistorique) : [];
      historique.push(historiqueEntry);
      await AsyncStorage.setItem('soldeHistorique', JSON.stringify(historique));

      setMessage(`✅ Solde ${modalType === 'Dépôt' ? 'ajouté' : 'retiré'} avec succès.`);
      setModalVisible(false);
      setSoldeInput('');
    } catch (error) {
      console.error('Erreur mise à jour solde:', error);
      setMessage('❌ Erreur lors de la mise à jour du solde.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>📅 {currentDate}</Text>
      <Text style={styles.solde}>💳 Solde disponible : {soldeDisponible} Ar</Text>

      <TouchableOpacity
        style={styles.soldeButton}
        onPress={() => {
          setModalType('Dépôt');
          setModalVisible(true);
        }}
      >
        <Text style={styles.soldeButtonText}>➕ Ajouter Solde</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.soldeButton}
        onPress={() => {
          setModalType('Retrait');
          setModalVisible(true);
        }}
      >
        <Text style={styles.soldeButtonText}>➖ Retirer Solde</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Type</Text>
      <Picker
        selectedValue={type}
        onValueChange={setType}
        style={styles.input}
      >
        <Picker.Item label="Dépôt" value="Dépôt" />
        <Picker.Item label="Retrait" value="Retrait" />
      </Picker>

      <Text style={styles.label}>Nom du client (optionnel)</Text>
      <TextInput
        style={styles.inputSmall}
        value={name}
        onChangeText={setName}
        placeholder="Nom du client"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Numéro de téléphone *</Text>
      <TextInput
        style={styles.inputSmall}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholder="Numéro téléphone"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Montant *</Text>
      <TextInput
        style={styles.inputSmall}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Montant"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Commission *</Text>
      <TextInput
        style={styles.inputSmall}
        keyboardType="numeric"
        value={commission}
        onChangeText={setCommission}
        placeholder="Commission"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Référence / Code *</Text>
      <TextInput
        style={styles.inputSmall}
        value={reference}
        onChangeText={setReference}
        placeholder="Référence ou code"
        placeholderTextColor="#888"
      />

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>🔘 Enregistrer</Text>
      </TouchableOpacity>

      {message !== '' && <Text style={styles.message}>{message}</Text>}

      {/* Modal ajout/retrait solde */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>
              {modalType === 'Dépôt' ? 'Ajouter au solde' : 'Retirer du solde'}
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={soldeInput}
              onChangeText={setSoldeInput}
              placeholder="Montant en Ariary"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={handleSoldeConfirm}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  title: { color: '#00ffcc', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  date: { color: '#ccc', fontSize: 16, marginBottom: 10 },
  solde: { color: '#00ffcc', fontSize: 16, marginBottom: 20 },
  soldeButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  soldeButtonText: {
    color: '#00ffcc',
    fontSize: 14,
  },
  label: { color: '#fff', marginTop: 10, fontSize: 14 },
  input: { backgroundColor: '#222', color: '#fff', borderRadius: 10, marginTop: 5 },
  inputSmall: {
    backgroundColor: '#222',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    borderRadius: 8,
    marginTop: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#00ffcc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#111', fontWeight: 'bold' },
  message: { marginTop: 15, color: '#0f0', fontSize: 14, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },

  cancelButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#00ffcc',
    fontSize: 14,
  },
});
