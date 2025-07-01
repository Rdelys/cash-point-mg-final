import React, { useState } from 'react';
import { View, Text, Picker, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FormCredit({ title }) {
  const [amount, setAmount] = useState('1000');
  const [duration, setDuration] = useState('1');
  const [message, setMessage] = useState('');
  const currentDate = new Date().toLocaleDateString();

  const handleSubmit = async () => {
    const newData = {
      title,
      amount,
      duration,
      date: currentDate,
    };

    try {
      const existing = await AsyncStorage.getItem('credits');
      const credits = existing ? JSON.parse(existing) : [];
      credits.push(newData);
      await AsyncStorage.setItem('credits', JSON.stringify(credits));

      setMessage('✅ Crédit ajouté avec succès.');
      console.log('Crédit enregistré :', newData);

      // Reset
      setAmount('1000');
      setDuration('1');
    } catch (error) {
      console.error('Erreur sauvegarde crédit:', error);
      setMessage('❌ Une erreur est survenue lors de la sauvegarde.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>📅 {currentDate}</Text>

      <Text style={styles.label}>Montant</Text>
      <Picker selectedValue={amount} onValueChange={setAmount} style={styles.input}>
        {['1000', '2000', '3000', '5000', '10000'].map((val) => (
          <Picker.Item key={val} label={val} value={val} />
        ))}
      </Picker>

      <Text style={styles.label}>Nombre</Text>
      <Picker selectedValue={duration} onValueChange={setDuration} style={styles.input}>
        {[...Array(10)].map((_, i) => (
          <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
        ))}
      </Picker>

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Soumettre</Text>
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
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
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
