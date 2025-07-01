import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function HomeScreen() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const navigation = useNavigation();

  const handleMenuClick = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const selectSection = (section) => {
    setSidebarVisible(false);
    setExpandedMenu(null);

    switch (section) {
      case 'mobile_airtel':
        navigation.navigate('MobileAirtel');
        break;
      case 'mobile_mvola':
        navigation.navigate('MobileMVola');
        break;
      case 'mobile_orange':
        navigation.navigate('MobileOrange');
        break;
      case 'credit_airtel':
        navigation.navigate('CreditAirtel');
        break;
      case 'credit_yas':
        navigation.navigate('CreditYAS');
        break;
      case 'credit_orange':
        navigation.navigate('CreditOrange');
        break;
      default:
        setActiveSection(section);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CASH POINT MG</Text>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color="#00ffcc" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeSection === 'dashboard' && <DashboardView />}
      </View>

      <Modal
        isVisible={isSidebarVisible}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        onBackdropPress={() => setSidebarVisible(false)}
        style={styles.modal}
      >
        <View style={styles.sidebar}>
          <ScrollView>
            <Text style={styles.menuTitle}>📍 Menu</Text>

            <TouchableOpacity onPress={() => selectSection('dashboard')}>
              <Text style={styles.menuItem}>📊 Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleMenuClick('mobile')}>
              <Text style={styles.menuItem}>
                📱 Mobile Money {expandedMenu === 'mobile' ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>
            {expandedMenu === 'mobile' && (
              <View style={styles.subMenu}>
                <TouchableOpacity onPress={() => selectSection('mobile_airtel')}>
                  <Text style={styles.subMenuItem}>• Airtel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectSection('mobile_mvola')}>
                  <Text style={styles.subMenuItem}>• MVola</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectSection('mobile_orange')}>
                  <Text style={styles.subMenuItem}>• Orange Money</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => handleMenuClick('credit')}>
              <Text style={styles.menuItem}>
                💳 Crédit {expandedMenu === 'credit' ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>
            {expandedMenu === 'credit' && (
              <View style={styles.subMenu}>
                <TouchableOpacity onPress={() => selectSection('credit_airtel')}>
                  <Text style={styles.subMenuItem}>• Airtel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectSection('credit_yas')}>
                  <Text style={styles.subMenuItem}>• YAS</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectSection('credit_orange')}>
                  <Text style={styles.subMenuItem}>• Orange</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function DashboardView() {
  const [mobileData, setMobileData] = useState([]);
  const [creditData, setCreditData] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    loadData();
  }, [filterDate]);

  const loadData = async () => {
    try {
      const mobile = await AsyncStorage.getItem('mobileMoney');
      const credit = await AsyncStorage.getItem('credits');

      const mobileParsed = mobile ? JSON.parse(mobile) : [];
      const creditParsed = credit ? JSON.parse(credit) : [];

      const filteredMobile = mobileParsed.filter((item) => item.date === filterDate);
      const filteredCredit = creditParsed.filter((item) => item.date === filterDate);

      setMobileData(filteredMobile);
      setCreditData(filteredCredit);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    }
  };

  const totalDepot = mobileData.filter((t) => t.type === 'Dépôt').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalRetrait = mobileData.filter((t) => t.type === 'Retrait').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalCommission = mobileData.reduce((sum, t) => sum + Number(t.commission), 0);
  const totalCredit = creditData.reduce((sum, t) => sum + Number(t.amount) * Number(t.duration), 0);

  return (
    <ScrollView>
      <Text style={styles.sectionTitle}>📊 Résumé Journalier</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Dépôts : <Text style={styles.value}>{totalDepot} Ar</Text></Text>
        <Text style={styles.label}>Retraits : <Text style={styles.value}>{totalRetrait} Ar</Text></Text>
        <Text style={styles.label}>Commissions : <Text style={styles.value}>{totalCommission} Ar</Text></Text>
        <Text style={styles.label}>Crédit (montant x Nombre) : <Text style={styles.value}>{totalCredit} Ar</Text></Text>
      </View>

      <Text style={styles.sectionTitle}>📅 Historique</Text>
      <TextInput
        style={styles.input}
        placeholder="jj/mm/aaaa"
        placeholderTextColor="#777"
        value={filterDate}
        onChangeText={setFilterDate}
      />
      
      <Text style={styles.sectionTitle}>📋 Transactions du jour</Text>
      {[...mobileData, ...creditData].map((item, idx) => (
        <View key={idx} style={styles.transaction}>
          <Text style={styles.txTitle}>{item.title}</Text>
          <Text style={styles.txDetail}>
            {item.type || 'Crédit'} - {item.amount} Ar - {item.date}
          </Text>
          {item.name && <Text style={styles.txDetail}>Nom: {item.name}</Text>}
          {item.reference && <Text style={styles.txDetail}>Référence: {item.reference}</Text>}
        </View>
      ))}

      <Text style={styles.sectionTitle}>💳 Crédits</Text>
      {creditData.length > 0 ? (
        creditData.map((credit, idx) => (
          <View key={idx} style={styles.transaction}>
            <Text style={styles.txTitle}>Crédit - {credit.amount} Ar</Text>
            <Text style={styles.txDetail}>Durée: {credit.duration} mois</Text>
            <Text style={styles.txDetail}>Date: {credit.date}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.txDetail}>Aucun crédit enregistré pour cette date.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#00ffcc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    flex: 1,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  sidebar: {
    width: '75%',
    height: '100%',
    backgroundColor: '#1e1e1e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 30,
  },
  menuItem: {
    color: '#fff',
    fontSize: 18,
    paddingVertical: 12,
  },
  subMenu: {
    paddingLeft: 15,
    paddingBottom: 10,
  },
  subMenuItem: {
    color: '#bbb',
    fontSize: 16,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#00ccff',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    color: '#fff',
    fontWeight: 'bold',
  },
  transaction: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  txTitle: {
    color: '#00ffcc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  txDetail: {
    color: '#ccc',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    marginTop: 10,
  },
});
