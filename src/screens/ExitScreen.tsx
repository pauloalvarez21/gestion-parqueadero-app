import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Platform
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
import useModal from '../hooks/useModal';

type ExitScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Salida'>;

const ExitScreen = () => {
  const navigation = useNavigation<ExitScreenNavigationProp>();
  const [placa, setPlaca] = useState('');
  const [codigoTicket, setCodigoTicket] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const { ModalComponent, showSuccess, showError, showInfo } = useModal();

  const handlePlateChange = (text: string) => {
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length > 6) return;
    if (cleaned.length > 3) {
      setPlaca(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`);
    } else {
      setPlaca(cleaned);
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
          showInfo('Permiso denegado', 'No podemos abrir la cámara sin permisos.');
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
          showInfo('Atención', 'No se pudo detectar una placa clara.');
        }
      }
    } catch (error) {
      showError('Error', 'Falló el reconocimiento de texto.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExit = async () => {
    if (!placa.trim() && !codigoTicket.trim()) {
      showError('Error', 'Por favor ingresa la placa o el código del ticket');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/parqueadero/salida', {
        placa: placa ? placa.toUpperCase().trim() : undefined,
        codigoTicket: codigoTicket ? codigoTicket.trim() : undefined,
        observaciones: observaciones ? observaciones.trim() : '',
      });

      setPlaca('');
      setCodigoTicket('');
      setObservaciones('');

      const { valorTotal, duracionHoras, duracionMinutos, mensaje, creadoPor, finalizadoPor } = response.data;

      showSuccess(
        'Salida Registrada',
        `Mensaje: ${mensaje || 'Pago calculado'}\nTiempo: ${duracionHoras}h ${duracionMinutos}m\nTotal a cobrar: $${valorTotal}${creadoPor ? `\n\nIngresado por: ${creadoPor}` : ''}${finalizadoPor ? `\nFinalizado por: ${finalizadoPor}` : ''}`,
      );
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error: any) {
      showError('Error', error.response?.data?.message || 'No se pudo registrar la salida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {ModalComponent}
        <ScreenContainer>
          <View style={styles.header}>
            <AppText type="black" size={32}>Registrar</AppText>
            <AppText type="black" size={32} color="primary">Salida</AppText>
            <AppText color="textSecondary" style={{ marginTop: 4 }}>
              Finaliza el tiempo de estancia
            </AppText>
          </View>

          <GlassCard style={styles.formCard}>
            <View style={styles.section}>
              <AppText type="semiBold" size={14} color="textSecondary" style={styles.label}>
                PLACA DEL VEHÍCULO
              </AppText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.plateInput}
                  value={placa}
                  onChangeText={handlePlateChange}
                  placeholder="AAA-123"
                  placeholderTextColor={theme.colors.textDimmed}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={7}
                />
                <TouchableOpacity 
                  style={styles.scanButton} 
                  onPress={handleScanPlate}
                  activeOpacity={0.7}
                >
                  <AppText size={20}>📷</AppText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.line} />
              <AppText type="bold" size={12} color="textDimmed" style={styles.orText}>Ó</AppText>
              <View style={styles.line} />
            </View>

            <View style={styles.section}>
              <AppText type="semiBold" size={14} color="textSecondary" style={styles.label}>
                CÓDIGO DEL TICKET
              </AppText>
              <TextInput
                style={styles.input}
                value={codigoTicket}
                onChangeText={setCodigoTicket}
                placeholder="Ej: TKT-123456"
                placeholderTextColor={theme.colors.textDimmed}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <View style={styles.section}>
              <AppText type="semiBold" size={14} color="textSecondary" style={styles.label}>
                OBSERVACIONES (OPCIONAL)
              </AppText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Ej: Abolladura en la puerta..."
                placeholderTextColor={theme.colors.textDimmed}
                multiline
              />
            </View>

            <PrimaryButton
              title="REGISTRAR SALIDA"
              onPress={handleRegisterExit}
              isLoading={loading}
              style={styles.submitButton}
            />
          </GlassCard>
        </ScreenContainer>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.xl,
  },
  formCard: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.sm,
    letterSpacing: 1,
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
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  orText: {
    marginHorizontal: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
});

export default ExitScreen;
