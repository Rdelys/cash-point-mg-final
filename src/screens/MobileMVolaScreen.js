import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FormMobileMoney from './components/FormMobileMoney';

export default function MobileMVolaScreen() {
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

      {/* Formulaire Mobile Money */}
      <FormMobileMoney title="Mobile Money - MVola" />
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
