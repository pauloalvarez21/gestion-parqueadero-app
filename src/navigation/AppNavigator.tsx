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
import StatisticsScreen from '../screens/StatisticsScreen';
import HistoryScreen from '../screens/HistoryScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Entrada: undefined;
  Salida: undefined;
  Tickets: undefined;
  RegistroUsuario: undefined;
  Espacios: undefined;
  Tarifas: undefined;
  Vehiculos: undefined;
  Estadisticas: undefined;
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
          component={Tarifas} // Note: The import above says TariffsScreen, double checking name in Component call
          options={{ title: 'Tarifas' }} 
        />
        <Stack.Screen 
          name="Vehiculos" 
          component={VehiclesScreen} 
          options={{ title: 'Vehículos' }} 
        />
        <Stack.Screen 
          name="Estadisticas" 
          component={StatisticsScreen} 
          options={{ title: 'Estadísticas' }} 
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

// Fix for component naming mismatch
const Tarifas = TariffsScreen;

export default AppNavigator;
