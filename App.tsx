import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import BootSplash from 'react-native-bootsplash';

export default function App() {
  useEffect(() => {
    const init = async () => {
      // Aquí podrías cargar datos iniciales, tokens, etc.
      // Por ahora simulamos una carga de 1.5 segundos para que se vea el splash
      await new Promise(resolve => setTimeout(() => resolve(true), 1500));
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log('BootSplash hidden');
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
