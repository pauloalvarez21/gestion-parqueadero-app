import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

interface Vehiculo {
  id?: number;
  placa: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  nombrePropietario?: string;
  telefonoPropietario?: string;
}

const VehiclesScreen = () => {
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para búsqueda
  const [searchPlaca, setSearchPlaca] = useState('');

  // Estados para nuevo vehículo
  const [newPlaca, setNewPlaca] = useState('');
  const [newTipo, setNewTipo] = useState<'CARRO' | 'MOTO' | 'BICICLETA'>('CARRO');
  const [newMarca, setNewMarca] = useState('');
  const [newModelo, setNewModelo] = useState('');
  const [newNombrePropietario, setNewNombrePropietario] = useState('');
  const [newTelefonoPropietario, setNewTelefonoPropietario] = useState('');

  // Estado para mostrar el "modal" de registro
  const [showAddForm, setShowAddForm] = useState(false);

  const loadVehicles = async (query = '') => {
    try {
      setLoading(true);
      console.log('Iniciando carga de vehículos...');
      
      let url = '/api/vehiculos';
      if (query.trim()) {
        url += `?placa=${query.trim().toUpperCase()}`;
      }
      
      console.log('Consultando URL:', url);
      const response = await api.get(url);
      
      console.log('Vehículos encontrados:', response.data);
      setVehicles(response.data);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVehicles(searchPlaca);
    }, [])
  );

  const handleSearch = () => {
    loadVehicles(searchPlaca);
  };

  const addVehicle = async () => {
    if (!newPlaca.trim()) {
      Alert.alert('Error', 'Por favor ingresa la placa.');
      return;
    }

    try {
      setActionLoading(true);
      const vehicleData = {
        placa: newPlaca.trim().toUpperCase(),
        tipo: newTipo,
        marca: newMarca,
        modelo: newModelo,
        nombrePropietario: newNombrePropietario,
        telefonoPropietario: newTelefonoPropietario,
      };

      console.log('Registrando vehículo:', vehicleData);
      await api.post('/api/vehiculos', vehicleData);
      
      Alert.alert('Éxito', 'Vehículo registrado con éxito.');
      setNewPlaca('');
      setNewMarca('');
      setNewModelo('');
      setNewNombrePropietario('');
      setNewTelefonoPropietario('');
      setShowAddForm(false);
      loadVehicles(searchPlaca);
    } catch (error: any) {
      console.error('Error adding vehicle:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar el vehículo.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          
          {/* Card 1: Buscador */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Buscar Vehículo 🔍</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchPlaca}
                onChangeText={setSearchPlaca}
                placeholder="Ingresar placa (Ej: AAA-123)"
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón para mostrar formulario de registro */}
          <TouchableOpacity 
            style={styles.addTrigger} 
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Text style={styles.addTriggerText}>
              {showAddForm ? '✕ Cancelar' : '➕ Registrar Nuevo Vehículo'}
            </Text>
          </TouchableOpacity>

          {/* Card 2: Formulario de Registro (Condicional) */}
          {showAddForm && (
            <View style={[styles.card, styles.addFormCard]}>
              <Text style={styles.cardTitle}>Nuevo Registro 🚙</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Placa</Text>
                <TextInput
                  style={styles.input}
                  value={newPlaca}
                  onChangeText={setNewPlaca}
                  placeholder="Ej: XYZ-789"
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.optionsRow}>
                  {(['CARRO', 'MOTO', 'BICICLETA'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.optionButton, newTipo === t && styles.optionSelected]}
                      onPress={() => setNewTipo(t)}
                    >
                      <Text style={[styles.optionText, newTipo === t && styles.optionTextSelected]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Marca (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={newMarca}
                  onChangeText={setNewMarca}
                  placeholder="Ej: Toyota"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Modelo (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={newModelo}
                  onChangeText={setNewModelo}
                  placeholder="Ej: Corolla"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Propietario (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={newNombrePropietario}
                  onChangeText={setNewNombrePropietario}
                  placeholder="Nombre completo"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={newTelefonoPropietario}
                  onChangeText={setNewTelefonoPropietario}
                  placeholder="Ej: 3001234567"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity 
                style={[styles.btn, styles.btnSuccess, actionLoading && styles.btnDisabled]}
                onPress={addVehicle}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Registrar Vehículo</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Card 3: Listado de Vehículos */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Vehículos Registrados 📋</Text>
            
            {loading ? (
              <ActivityIndicator color="#007AFF" style={{ marginVertical: 20 }} />
            ) : vehicles.length === 0 ? (
              <Text style={styles.emptyText}>No se encontraron vehículos.</Text>
            ) : (
              vehicles.map((v, index) => (
                <View key={v.id?.toString() || index.toString()} style={styles.vehicleRow}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.placaText}>{v.placa}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{v.tipo}</Text>
                    </View>
                  </View>
                  <Text style={styles.idText}>ID: {v.id}</Text>
                </View>
              ))
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addFormCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addTrigger: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  addTriggerText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  optionTextSelected: {
    color: '#fff',
  },
  btn: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnSuccess: {
    backgroundColor: '#28a745',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  placaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#1976D2',
    fontSize: 10,
    fontWeight: 'bold',
  },
  idText: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
});

export default VehiclesScreen;
