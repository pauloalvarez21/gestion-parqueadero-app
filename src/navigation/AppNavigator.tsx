import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import EntryScreen from '../screens/EntryScreen';
import ExitScreen from '../screens/ExitScreen';
import TicketsScreen from '../screens/TicketsScreen';
import RegisterUserScreen from '../screens/RegisterUserScreen';
import SpaceManagementScreen from '../screens/SpaceManagementScreen';
import TariffsScreen from '../screens/TariffsScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import BillingScreen from '../screens/BillingScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Entrada: undefined;
  Salida: undefined;
  Tickets: undefined;
  RegistroUsuario: undefined;
  Espacios: undefined;
  Tarifas: undefined;
  Billing: undefined;
  Vehiculos: undefined;
  Dashboard: undefined;
  Historial: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: theme.fonts.bold,
            fontSize: 16,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Entrada" 
          component={EntryScreen} 
          options={{ title: 'Nueva Entrada' }} 
        />
        <Stack.Screen 
          name="Salida" 
          component={ExitScreen} 
          options={{ title: 'Registrar Salida' }} 
        />
        <Stack.Screen 
          name="Tickets" 
          component={TicketsScreen} 
          options={{ title: 'Tickets Activos' }} 
        />
        <Stack.Screen 
          name="RegistroUsuario" 
          component={RegisterUserScreen} 
          options={{ title: 'Usuarios' }} 
        />
        <Stack.Screen 
          name="Espacios" 
          component={SpaceManagementScreen} 
          options={{ title: 'Espacios' }} 
        />
        <Stack.Screen
          name="Tarifas"
          component={TariffsScreen}
          options={{ title: 'Tarifas' }}
        />
        <Stack.Screen
          name="Billing"
          component={BillingScreen}
          options={{ title: 'Facturación' }}
        />
        <Stack.Screen
          name="Vehiculos"
          component={VehiclesScreen}
          options={{ title: 'Vehículos' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen
          name="Historial" 
          component={HistoryScreen} 
          options={{ title: 'Historial de Tickets' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
