import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Picker, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FormMobileMoney({ title }) {
  const [type, setType] = useState('Dépôt');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const currentDate = new Date().toLocaleDateString();

  const handleSubmit = async () => {
    if (!phone || !amount || !commission || !reference) {
      setMessage('⚠️ Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newData = {
      title,
      type,
      name,
      phone,
      amount,
      commission,
      reference,
      date: currentDate,
    };

    try {
      const existing = await AsyncStorage.getItem('mobileMoney');
      const records = existing ? JSON.parse(existing) : [];
      records.push(newData);
      await AsyncStorage.setItem('mobileMoney', JSON.stringify(records));

      setMessage('✅ Transaction ajoutée avec succès.');
      console.log('Transaction enregistrée :', newData);

      // Reset
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>📅 {currentDate}</Text>

      <Text style={styles.label}>Type</Text>
      <Picker selectedValue={type} onValueChange={setType} style={styles.input}>
        <Picker.Item label="Dépôt" value="Dépôt" />
        <Picker.Item label="Retrait" value="Retrait" />
      </Picker>

      <Text style={styles.label}>Nom du client (optionnel)</Text>
      <TextInput style={styles.inputSmall} value={name} onChangeText={setName} />

      <Text style={styles.label}>Numéro de téléphone *</Text>
      <TextInput style={styles.inputSmall} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

      <Text style={styles.label}>Montant *</Text>
      <TextInput style={styles.inputSmall} keyboardType="numeric" value={amount} onChangeText={setAmount} />

      <Text style={styles.label}>Commission *</Text>
      <TextInput style={styles.inputSmall} keyboardType="numeric" value={commission} onChangeText={setCommission} />

      <Text style={styles.label}>Référence / Code *</Text>
      <TextInput style={styles.inputSmall} value={reference} onChangeText={setReference} />

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>🔘 Enregistrer</Text>
      </TouchableOpacity>

      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
  },
  title: {
    color: '#00ffcc',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },
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
  buttonText: {
    color: '#111',
    fontWeight: 'bold',
  },
  message: {
    marginTop: 15,
    color: '#0f0',
    fontSize: 14,
    textAlign: 'center',
  },
});
