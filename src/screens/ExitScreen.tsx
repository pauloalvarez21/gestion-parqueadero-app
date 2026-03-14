import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
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

type ExitScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Salida'>;

const ExitScreen = () => {
  const navigation = useNavigation<ExitScreenNavigationProp>();
  const [placa, setPlaca] = useState('');
  const [codigoTicket, setCodigoTicket] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  // Mismo manejo de placa que EntryScreen
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
            message: "La aplicación necesita acceso a tu cámara para poder escanear las placas de los vehículos.",
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

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      setLoading(true);
      const uri = result.assets[0].uri;
      if (uri) {
        const recognizedText = await TextRecognition.recognize(uri);
        const plateRegex = /[A-Z]{3}[-]?[0-9]{3,4}/;
        const found = recognizedText.find((text) => plateRegex.test(text.toUpperCase()));

        if (found) {
          handlePlateChange(found);
        } else {
          Alert.alert('Aviso', 'No se pudo detectar una placa clara en la imagen.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Falló el reconocimiento de texto.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExit = async () => {
    if (!placa.trim() && !codigoTicket.trim()) {
      Alert.alert('Error', 'Por favor ingresa la placa del vehículo o el código del ticket');
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

      const { valorTotal, duracionHoras, duracionMinutos, mensaje } = response.data;

      Alert.alert(
        'Salida Registrada',
        `Mensaje: ${mensaje || 'Pago calculado'}\nTiempo: ${duracionHoras}h ${duracionMinutos}m\nTotal a cobrar: $${valorTotal}`,
        [
          { text: 'Aceptar', onPress: () => navigation.goBack() }
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('Error al registrar salida:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo registrar la salida'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Registrar Salida</Text>
          <Text style={styles.subtitle}>Escanea la placa o ingresa el ticket</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Placa del Vehículo</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={placa}
                onChangeText={handlePlateChange}
                placeholder="AAA-123"
                placeholderTextColor="#ccc"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={7}
              />
              <TouchableOpacity style={styles.cameraButton} onPress={handleScanPlate}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.orText}>- Ó -</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Código del Ticket</Text>
            <TextInput
              style={styles.inputFull}
              value={codigoTicket}
              onChangeText={setCodigoTicket}
              placeholder="Ej: TKT-123456"
              placeholderTextColor="#ccc"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Observaciones (opcional)</Text>
            <TextInput
              style={styles.inputFull}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Ej: Abolladura en la puerta..."
              placeholderTextColor="#ccc"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegisterExit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrar Salida 🏁</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputFull: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  cameraButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 20,
    color: '#fff',
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF', 
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ExitScreen;
