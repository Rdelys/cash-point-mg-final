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
  const [totalDisponible, setTotalDisponible] = useState(0);
  const [totalMobileDisponible, setTotalMobileDisponible] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false); // <-- AJOUTÉ


  useEffect(() => {
    loadData();
  }, [filterDate]);

  const loadData = async () => {
    try {
      const mobile = await AsyncStorage.getItem('mobileMoney');
      const credit = await AsyncStorage.getItem('credits');

      const mobileParsed = mobile ? JSON.parse(mobile) : [];
      const creditParsed = credit ? JSON.parse(credit) : [];

      const filteredMobile = mobileParsed.filter(item => item.date === filterDate);
      const filteredCredit = creditParsed.filter(item => item.date === filterDate);

      setMobileData(filteredMobile);
      setCreditData(filteredCredit);

      const histoRaw = await AsyncStorage.getItem('creditHistorique');
      const historique = histoRaw ? JSON.parse(histoRaw) : [];

      const filteredHisto = historique.filter(
        h => h.date === filterDate && (
          h.title.toLowerCase().includes('airtel') ||
          h.title.toLowerCase().includes('yas') ||
          h.title.toLowerCase().includes('orange')
        )
      );

      const totalRechargeDuJour = filteredHisto.reduce((sum, h) => sum + Number(h.amount), 0);

      const dispoAirtel = parseInt(await AsyncStorage.getItem('disponible_crédit_-_airtel')) || 0;
      const dispoYas = parseInt(await AsyncStorage.getItem('disponible_crédit_-_yas')) || 0;
      const dispoOrange = parseInt(await AsyncStorage.getItem('disponible_crédit_-_orange')) || 0;

      setTotalDisponible(dispoAirtel + dispoYas + dispoOrange + totalRechargeDuJour);

      const soldeHistoriqueRaw = await AsyncStorage.getItem('soldeHistorique');
      const soldeHistorique = soldeHistoriqueRaw ? JSON.parse(soldeHistoriqueRaw) : [];

      const filteredSoldeHisto = soldeHistorique.filter(
        h => h.date === filterDate && (
          h.title.toLowerCase().includes('airtel') ||
          h.title.toLowerCase().includes('mvola') ||
          h.title.toLowerCase().includes('orange')
        )
      );

      const totalMouvementsMobile = filteredSoldeHisto.reduce((sum, h) => {
        const val = Number(h.amount);
        return h.type === 'Dépôt' ? sum + val : sum - val;
      }, 0);

      const soldeAirtel = parseInt(await AsyncStorage.getItem('solde_airtel')) || 0;
      const soldeMVola = parseInt(await AsyncStorage.getItem('solde_mvola')) || 0;
      const soldeOrange = parseInt(await AsyncStorage.getItem('solde_orange')) || 0;

      const totalMobileSoldeActuel = soldeAirtel + soldeMVola + soldeOrange;

      setTotalMobileDisponible(totalMobileSoldeActuel + totalMouvementsMobile);

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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <TouchableOpacity
          onPress={loadData}
          style={{ backgroundColor: '#00ccff', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, marginRight: 10, flex: 1 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>🔄 Actualiser</Text>
        </TouchableOpacity>
        <TouchableOpacity
  onPress={() => setShowConfirmModal(true)}
  style={{
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
  }}
>
  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
    🗑️ Réinitialiser
  </Text>
</TouchableOpacity>

      </View>

      <Text style={styles.sectionTitle}>📊 Résumé Journalier</Text>
      <View style={styles.cardsRow}>
        <View style={[styles.miniCard, { backgroundColor: '#003366' }]}>
          <Text style={styles.cardTitle}>💰 Dépôts</Text>
          <Text style={styles.cardValue}>{totalDepot} Ar</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: '#660000' }]}>
          <Text style={styles.cardTitle}>💸 Retraits</Text>
          <Text style={styles.cardValue}>{totalRetrait} Ar</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.miniCard, { backgroundColor: '#004d00' }]}>
          <Text style={styles.cardTitle}>💼 Commissions</Text>
          <Text style={styles.cardValue}>{totalCommission} Ar</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: '#333300' }]}>
          <Text style={styles.cardTitle}>📄 Crédit</Text>
          <Text style={styles.cardValue}>{totalCredit} Ar</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.miniCard, { backgroundColor: '#001f33' }]}>
          <Text style={styles.cardTitle}>💳 Crédit Disponible</Text>
          <Text style={styles.cardValue}>{totalDisponible} Ar</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.miniCard, { backgroundColor: '#003300' }]}>
          <Text style={styles.cardTitle}>💼 Solde Mobile Disponible</Text>
          <Text style={styles.cardValue}>{totalMobileDisponible} Ar</Text>
        </View>
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
      <Modal isVisible={showConfirmModal}>
  <View style={{ backgroundColor: '#222', padding: 20, borderRadius: 10 }}>
    <Text style={{ color: '#fff', fontSize: 18, marginBottom: 15 }}>
      Voulez-vous vraiment réinitialiser toutes les données du jour ?
    </Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#00ccff',
          padding: 10,
          borderRadius: 8,
          flex: 1,
          marginRight: 10,
        }}
        onPress={() => setShowConfirmModal(false)}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Annuler</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: '#ff4444',
          padding: 10,
          borderRadius: 8,
          flex: 1,
        }}
        onPress={async () => {
          try {
            const currentDate = new Date().toLocaleDateString();
            const keysToRemove = [
              'mobileMoney',
              'credits',
              'solde_airtel',
              'solde_mvola',
              'solde_orange',
              'disponible_crédit_-_airtel',
              'disponible_crédit_-_yas',
              'disponible_crédit_-_orange',
            ];
            for (const key of keysToRemove) {
              await AsyncStorage.removeItem(key);
            }

            const soldeHistRaw = await AsyncStorage.getItem('soldeHistorique');
            const soldeHist = soldeHistRaw ? JSON.parse(soldeHistRaw) : [];
            const soldeFiltered = soldeHist.filter(item => item.date !== currentDate);
            await AsyncStorage.setItem('soldeHistorique', JSON.stringify(soldeFiltered));

            const creditHistRaw = await AsyncStorage.getItem('creditHistorique');
            const creditHist = creditHistRaw ? JSON.parse(creditHistRaw) : [];
            const creditFiltered = creditHist.filter(item => item.date !== currentDate);
            await AsyncStorage.setItem('creditHistorique', JSON.stringify(creditFiltered));

            setMobileData([]);
            setCreditData([]);
            setTotalDisponible(0);
            setTotalMobileDisponible(0);
            setShowConfirmModal(false);
          } catch (e) {
            console.error('Erreur réinitialisation complète:', e);
          }
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Confirmer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

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
  input: {
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    marginTop: 10,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  miniCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
    fontWeight: '600',
  },
  cardValue: {
    color: '#00ffcc',
    fontSize: 14,
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
});
