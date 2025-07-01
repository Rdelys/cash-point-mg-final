import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import MobileAirtelScreen from './src/screens/MobileAirtelScreen';
import MobileMVolaScreen from './src/screens/MobileMVolaScreen';
import MobileOrangeScreen from './src/screens/MobileOrangeScreen';
import CreditAirtelScreen from './src/screens/CreditAirtelScreen';
import CreditYASScreen from './src/screens/CreditYASScreen';
import CreditOrangeScreen from './src/screens/CreditOrangeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MobileAirtel" component={MobileAirtelScreen} />
        <Stack.Screen name="MobileMVola" component={MobileMVolaScreen} />
        <Stack.Screen name="MobileOrange" component={MobileOrangeScreen} />
        <Stack.Screen name="CreditAirtel" component={CreditAirtelScreen} />
        <Stack.Screen name="CreditYAS" component={CreditYASScreen} />
        <Stack.Screen name="CreditOrange" component={CreditOrangeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}