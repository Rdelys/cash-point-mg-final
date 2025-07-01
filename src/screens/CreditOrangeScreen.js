import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FormCredit from './components/FormCredit';

export default function CreditOrangeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Button Retour */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>🔙 Retour</Text>
      </TouchableOpacity>

      {/* Formulaire Crédit */}
      <FormCredit title="Crédit - Orange" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    backgroundColor: '#00ffcc',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#111',
    fontWeight: 'bold',
  },
});
