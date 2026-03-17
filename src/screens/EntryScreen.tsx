import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Platform,
  ScrollView
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from 'react-native-text-recognition';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';

type EntryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entrada'>;

const EntryScreen = () => {
  const navigation = useNavigation<EntryScreenNavigationProp>();
  const [plate, setPlate] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<'CARRO' | 'MOTO' | 'CAMION' | 'BICICLETA'>('CARRO');
  const [tipoTarifa, setTipoTarifa] = useState<'POR_MINUTO' | 'POR_HORA' | 'POR_DIA' | 'POR_MES' | 'FRACCION'>('POR_HORA');
  const [loading, setLoading] = useState(false);

  const handlePlateChange = (text: string) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length > 6) return;
    if (cleaned.length > 3) {
      setPlate(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`);
    } else {
      setPlate(cleaned);
    }
  };

  const handleScanPlate = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Permiso de cámara",
            message: "La aplicación necesita acceso a tu cámara para poder escanear las placas.",
            buttonNeutral: "Preguntar luego",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'No podemos abrir la cámara sin permisos.');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        quality: 1,
        saveToPhotos: false,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      setLoading(true);
      const uri = result.assets[0].uri;
      if (uri) {
        const recognizedText = await TextRecognition.recognize(uri);
        const plateRegex = /[A-Z]{3}[-]?[0-9]{3,4}/;
        const found = recognizedText.find((text) => plateRegex.test(text.toUpperCase()));

        if (found) {
          handlePlateChange(found);
        } else {
          Alert.alert('Aviso', 'No se pudo detectar una placa clara.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Falló el recognition de texto.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEntry = async () => {
    if (!plate.trim() && tipoVehiculo !== 'BICICLETA') {
      Alert.alert('Error', 'Por favor ingresa la placa');
      return;
    }
    if (tipoVehiculo !== 'BICICLETA' && plate.length !== 7) {
      Alert.alert('Error', 'La placa no tiene el formato correcto (ej: AAA-123).');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/parqueadero/entrada', {
        placa: tipoVehiculo === 'BICICLETA' ? 'BICI' : plate.toUpperCase(),
        tipoVehiculo,
        tipoTarifa,
      });

      setPlate('');
      Alert.alert(
        'Éxito',
        `Entrada registrada.\nTicket: ${response.data.codigo || 'N/A'}`,
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo registrar la entrada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenContainer>
          <View style={styles.header}>
            <AppText type="black" size={32}>Nueva</AppText>
            <AppText type="black" size={32} color="primary">Entrada</AppText>
            <AppText color="textSecondary" style={{ marginTop: 4 }}>
              Registra el ingreso de un vehículo
            </AppText>
          </View>

          <GlassCard style={styles.formCard}>
            <View style={styles.section}>
              <AppText type="semiBold" size={14} color="textSecondary" style={styles.label}>
                TIPO DE VEHÍCULO
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                {(['CARRO', 'MOTO', 'CAMION', 'BICICLETA'] as const).map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    activeOpacity={0.7}
                    style={[styles.optionButton, tipoVehiculo === tipo && styles.optionSelected]}
                    onPress={() => setTipoVehiculo(tipo)}
                  >
                    <AppText 
                      type="bold" 
                      size={12} 
                      color={tipoVehiculo === tipo ? 'text' : 'textDimmed'}
                    >
                      {tipo}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <AppText type="semiBold" size={14} color="textSecondary" style={styles.label}>
                TIPO DE TARIFA
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                {(['POR_MINUTO', 'POR_HORA', 'POR_DIA', 'POR_MES', 'FRACCION'] as const).map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    activeOpacity={0.7}
                    style={[styles.optionButton, tipoTarifa === tipo && styles.optionSelected]}
                    onPress={() => setTipoTarifa(tipo)}
                  >
                    <AppText 
                      type="bold" 
                      size={12} 
                      color={tipoTarifa === tipo ? 'text' : 'textDimmed'}
                    >
                      {tipo.replace('POR_', '')}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <AppText type="semiBold" size={14} color="textSecondary" style={styles.label}>
                PLACA
              </AppText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.plateInput}
                  value={plate}
                  onChangeText={handlePlateChange}
                  placeholder="AAA-123"
                  placeholderTextColor={theme.colors.textDimmed}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={tipoVehiculo !== 'BICICLETA'}
                  maxLength={7}
                />
                {tipoVehiculo !== 'BICICLETA' && (
                  <TouchableOpacity 
                    style={styles.scanButton} 
                    onPress={handleScanPlate}
                    activeOpacity={0.7}
                  >
                    <AppText size={20}>📷</AppText>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <PrimaryButton
              title="REGISTRAR INGRESO"
              onPress={handleRegisterEntry}
              isLoading={loading}
              style={styles.submitButton}
            />
          </GlassCard>
        </ScreenContainer>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.xl,
  },
  formCard: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    marginBottom: theme.spacing.sm,
    letterSpacing: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  optionButton: {
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  plateInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 24,
    fontFamily: theme.fonts.black,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scanButton: {
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
});

export default EntryScreen;