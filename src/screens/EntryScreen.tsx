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
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type EntryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entrada'>;

export default function EntryScreen() {
  const navigation = useNavigation<EntryScreenNavigationProp>();
  const [plate, setPlate] = useState('');
  // Estados para los nuevos campos requeridos por el backend
  const [tipoVehiculo, setTipoVehiculo] = useState<'CARRO' | 'MOTO' | 'BICICLETA'>('CARRO');
  const [tipoTarifa, setTipoTarifa] = useState<'POR_MINUTO' | 'POR_HORA' | 'POR_DIA' | 'POR_MES'>('POR_HORA');
  const [loading, setLoading] = useState(false);

  const handlePlateChange = (text: string) => {
    // Esta función formatea la placa automáticamente a 'AAA-123'
    // Limpia la entrada para permitir solo letras y números
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Limita la longitud a 6 caracteres (sin contar el guion)
    if (cleaned.length > 6) {
      return;
    }

    if (cleaned.length > 3) {
      setPlate(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`);
    } else {
      setPlate(cleaned);
    }
  };

  const handleRegisterEntry = async () => {
    if (!plate.trim() && tipoVehiculo !== 'BICICLETA') {
      Alert.alert('Error', 'Por favor ingresa la placa del vehículo');
      return;
    }

    // Validación de longitud sobre la placa formateada (7 caracteres)
    if (tipoVehiculo !== 'BICICLETA' && plate.length !== 7) {
        Alert.alert('Error', 'La placa debe tener 7 caracteres (ej: AAA-123).');
        return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/parqueadero/entrada', {
        placa: tipoVehiculo === 'BICICLETA' ? 'BICI' : plate.toUpperCase(),
        tipoVehiculo,
        tipoTarifa,
      });

      setPlate(''); // Limpiar formulario
      Alert.alert(
        'Éxito',
        `Entrada registrada.\nTicket: ${response.data.codigo || 'N/A'}`,
        [
          { text: 'Aceptar', onPress: () => navigation.goBack() }
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('Error al registrar entrada:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo registrar la entrada'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Nueva Entrada</Text>
          <Text style={styles.subtitle}>Ingresa los datos del vehículo</Text>

          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Tipo de Vehículo</Text>
            <View style={styles.optionsRow}>
              {(['CARRO', 'MOTO', 'BICICLETA'] as const).map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.optionButton, tipoVehiculo === tipo && styles.optionSelected]}
                  onPress={() => setTipoVehiculo(tipo)}
                >
                  <Text style={[styles.optionText, tipoVehiculo === tipo && styles.optionTextSelected]}>{tipo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Tipo de Tarifa</Text>
            <View style={styles.optionsRow}>
              {(['POR_HORA', 'POR_DIA', 'POR_MES'] as const).map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.optionButton, tipoTarifa === tipo && styles.optionSelected]}
                  onPress={() => setTipoTarifa(tipo)}
                >
                  <Text style={[styles.optionText, tipoTarifa === tipo && styles.optionTextSelected]}>
                    {tipo.replace('POR_', '')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Placa del Vehículo</Text>
            <TextInput
              style={styles.input}
              value={plate}
              onChangeText={handlePlateChange}
              placeholder="AAA-123"
              placeholderTextColor="#ccc"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={tipoVehiculo !== 'BICICLETA'}
              maxLength={7}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegisterEntry}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrar Ingreso 🚗</Text>
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
    marginBottom: 30,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#28a745', // Color verde de "éxito"
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