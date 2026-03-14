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

interface TarifaDTO {
  id?: number;
  tipoTarifa: string;
  valor: number;
}

const TariffsScreen = () => {
  const [tarifas, setTarifas] = useState<TarifaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para el formulario de creación/edición
  const [selectedTipo, setSelectedTipo] = useState<string>('POR_HORA');
  const [valor, setValor] = useState('');

  const fetchTarifas = async () => {
    try {
      setLoading(true);
      console.log('Cargando tarifas...');
      const response = await api.get('/api/parqueadero/tarifas');
      console.log('Tarifas recibidas:', response.data);
      setTarifas(response.data);
    } catch (error: any) {
      console.error('Error al cargar tarifas:', error);
      Alert.alert('Error', 'No se pudieron cargar las tarifas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTarifas();
    }, [])
  );

  const handleSaveTarifa = async () => {
    if (!valor || isNaN(Number(valor))) {
      Alert.alert('Aviso', 'Por favor ingresa un valor numérico válido.');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        tipoTarifa: selectedTipo,
        valor: parseFloat(valor),
      };
      
      console.log('Guardando tarifa:', payload);
      await api.post('/api/parqueadero/tarifas', payload);
      
      Alert.alert('Éxito', 'Tarifa guardada correctamente.');
      setValor('');
      fetchTarifas();
    } catch (error: any) {
      console.error('Error al guardar tarifa:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo guardar la tarifa.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTarifa = (tipo: string) => {
    Alert.alert(
      'Eliminar Tarifa',
      `¿Estás seguro de que deseas eliminar la tarifa ${tipo.replace('POR_', '')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.delete(`/api/parqueadero/tarifas/${tipo}`);
              Alert.alert('Éxito', 'Tarifa eliminada.');
              fetchTarifas();
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo eliminar la tarifa.');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const tiposDisponibles = ['POR_MINUTO', 'POR_HORA', 'POR_DIA', 'POR_MES', 'FRACCION'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          
          {/* Card 1: Crear / Actualizar Tarifa */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Configurar Tarifas 💰</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Tarifa</Text>
              <View style={styles.optionsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                  {tiposDisponibles.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.optionButton, selectedTipo === t && styles.optionSelected]}
                      onPress={() => setSelectedTipo(t)}
                    >
                      <Text style={[styles.optionText, selectedTipo === t && styles.optionTextSelected]}>
                        {t.replace('POR_', '')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor ($)</Text>
              <TextInput
                style={styles.input}
                value={valor}
                onChangeText={setValor}
                placeholder="Ej: 3000"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity 
              style={[styles.btn, styles.btnPrimary, actionLoading && styles.btnDisabled]}
              onPress={handleSaveTarifa}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar Tarifa</Text>}
            </TouchableOpacity>
          </View>

          {/* Card 2: Lista de Tarifas */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Tarifas Vigentes 📋</Text>
            
            {loading ? (
              <ActivityIndicator color="#007AFF" style={{ marginVertical: 20 }} />
            ) : tarifas.length === 0 ? (
              <Text style={styles.emptyText}>No hay tarifas configuradas.</Text>
            ) : (
              tarifas.map((t, index) => (
                <View key={t.id?.toString() || index.toString()} style={styles.tariffRow}>
                  <View style={styles.tariffInfo}>
                    <Text style={styles.tariffLabel}>{t.tipoTarifa.replace('POR_', '')}</Text>
                    <Text style={styles.tariffValue}>${t.valor.toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteTarifa(t.tipoTarifa)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
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
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  optionsRow: {
    marginBottom: 5,
  },
  horizontalScroll: {
    gap: 10,
    paddingRight: 15,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    minWidth: 80,
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
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnPrimary: {
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
  tariffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tariffInfo: {
    flex: 1,
  },
  tariffLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tariffValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 10,
  },
  deleteBtnText: {
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
});

export default TariffsScreen;
