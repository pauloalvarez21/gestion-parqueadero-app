import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="Entrada" 
          component={EntryScreen} 
          options={{ title: 'Registrar Entrada', headerShown: true }} 
        />
        <Stack.Screen 
          name="Salida" 
          component={ExitScreen} 
          options={{ title: 'Registrar Salida', headerShown: true }} 
        />
        <Stack.Screen 
          name="Tickets" 
          component={TicketsScreen} 
          options={{ title: 'Tickets Activos', headerShown: true }} 
        />
        <Stack.Screen 
          name="RegistroUsuario" 
          component={RegisterUserScreen} 
          options={{ title: 'Crear Usuario', headerShown: true }} 
        />
        <Stack.Screen 
          name="Espacios" 
          component={SpaceManagementScreen} 
          options={{ title: 'Gestionar Espacios', headerShown: true }} 
        />
        <Stack.Screen 
          name="Tarifas" 
          component={TariffsScreen} 
          options={{ title: 'Tarifas del Parqueadero', headerShown: true }} 
        />
        <Stack.Screen 
          name="Vehiculos" 
          component={VehiclesScreen} 
          options={{ title: 'Registro de Vehículos', headerShown: true }} 
        />
        <Stack.Screen 
          name="Estadisticas" 
          component={StatisticsScreen} 
          options={{ title: 'Estadísticas del Parqueadero', headerShown: true }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
