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

interface EspacioDTO {
  id: number;
  codigo: string;
  tipoVehiculoPermitido: string;
  estado: string;
  tarifaBase: number;
  ocupado: boolean;
}

const SpaceManagementScreen = () => {
  const [espacios, setEspacios] = useState<EspacioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para agregar
  const [tipoAgregar, setTipoAgregar] = useState<'CARRO' | 'MOTO' | 'BICICLETA'>('CARRO');
  const [cantidadAgregar, setCantidadAgregar] = useState('');
  const [tarifaBase, setTarifaBase] = useState('');

  // Estados para eliminar
  const [tipoEliminar, setTipoEliminar] = useState<'CARRO' | 'MOTO' | 'BICICLETA'>('CARRO');
  const [cantidadEliminar, setCantidadEliminar] = useState('');

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      console.log('Iniciando petición a /api/parqueadero/espacios...');
      
      const response = await api.get('/api/parqueadero/espacios');
      
      console.log('Datos recibidos del backend:', response.data);
      setEspacios(response.data);
    } catch (error: any) {
      console.error('Error al cargar espacios:', error);
      
      const errorMsg = error.response?.data?.message || error.message || 'No se pudo conectar con el servidor';
      Alert.alert('Error de conexión', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEspacios();
    }, [])
  );

  const handleAggregate = async () => {
    if (!cantidadAgregar || !tarifaBase) {
      Alert.alert('Aviso', 'Por favor completa la cantidad y la tarifa base.');
      return;
    }

    try {
      setActionLoading(true);
      await api.post('/api/parqueadero/espacios/agregar', {
        tipoVehiculo: tipoAgregar,
        cantidad: parseInt(cantidadAgregar),
        tarifaBase: parseFloat(tarifaBase),
      });
      Alert.alert('Éxito', `${cantidadAgregar} espacios de ${tipoAgregar} agregados correctamente.`);
      setCantidadAgregar('');
      setTarifaBase('');
      fetchEspacios();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudieron agregar los espacios.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cantidadEliminar) {
      Alert.alert('Aviso', 'Por favor ingresa la cantidad a eliminar.');
      return;
    }

    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que deseas eliminar ${cantidadEliminar} espacios de ${tipoEliminar}? Solo se eliminarán los que estén DISPONIBLES.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              // Para DELETE con cuerpo en algunas configuraciones se necesita pasar 'data'
              await api.delete('/api/parqueadero/espacios/eliminar', {
                data: {
                  tipoVehiculo: tipoEliminar,
                  cantidad: parseInt(cantidadEliminar),
                }
              });
              Alert.alert('Éxito', `Operación completada.`);
              setCantidadEliminar('');
              fetchEspacios();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'No se pudieron eliminar los espacios.');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const getSummary = () => {
    const summary = {
      CARRO: { total: 0, disponible: 0, ocupado: 0 },
      MOTO: { total: 0, disponible: 0, ocupado: 0 },
      BICICLETA: { total: 0, disponible: 0, ocupado: 0 },
    };

    espacios.forEach((e) => {
      const type = e.tipoVehiculoPermitido as keyof typeof summary;
      if (summary[type]) {
        summary[type].total++;
        if (e.estado === 'DISPONIBLE') {
          summary[type].disponible++;
        } else if (e.estado === 'OCUPADO') {
          summary[type].ocupado++;
        }
      }
    });

    return summary;
  };

  const summary = getSummary();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          
          {/* Card 1: Resumen de Estado */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Estado Detallado 🅿️</Text>
            {loading ? (
              <ActivityIndicator color="#007AFF" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.summaryTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { flex: 1.5 }]}>Tipo</Text>
                  <Text style={styles.headerCell}>Dispo</Text>
                  <Text style={styles.headerCell}>Ocup</Text>
                  <Text style={styles.headerCell}>Total</Text>
                </View>
                {Object.entries(summary).map(([type, counts]) => (
                  <View key={type} style={styles.tableRow}>
                    <Text style={[styles.cellType, { flex: 1.5 }]}>{type}</Text>
                    <Text style={[styles.cellValue, { color: '#28a745' }]}>{counts.disponible}</Text>
                    <Text style={[styles.cellValue, { color: '#FF3B30' }]}>{counts.ocupado}</Text>
                    <Text style={[styles.cellValue, { fontWeight: 'bold' }]}>{counts.total}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Card 2: Agregar Espacios */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Agregar Espacios ➕</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Vehículo</Text>
              <View style={styles.optionsRow}>
                {(['CARRO', 'MOTO', 'BICICLETA'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.optionButton, tipoAgregar === t && styles.optionSelected]}
                    onPress={() => setTipoAgregar(t)}
                  >
                    <Text style={[styles.optionText, tipoAgregar === t && styles.optionTextSelected]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Cantidad</Text>
                <TextInput
                  style={styles.input}
                  value={cantidadAgregar}
                  onChangeText={setCantidadAgregar}
                  placeholder="Ej: 5"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Tarifa Base</Text>
                <TextInput
                  style={styles.input}
                  value={tarifaBase}
                  onChangeText={setTarifaBase}
                  placeholder="Ej: 2000"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.btn, styles.btnPrimary, actionLoading && styles.btnDisabled]}
              onPress={handleAggregate}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Agregar</Text>}
            </TouchableOpacity>
          </View>

          {/* Card 3: Eliminar Espacios */}
          <View style={[styles.card, { marginTop: 20, borderColor: '#FF3B30', borderWidth: 0.5 }]}>
            <Text style={[styles.cardTitle, { color: '#FF3B30' }]}>Eliminar Espacios 🗑️</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Vehículo</Text>
              <View style={styles.optionsRow}>
                {(['CARRO', 'MOTO', 'BICICLETA'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.optionButton, tipoEliminar === t && styles.optionSelectedDelete]}
                    onPress={() => setTipoEliminar(t)}
                  >
                    <Text style={[styles.optionText, tipoEliminar === t && styles.optionTextSelected]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cantidad a eliminar</Text>
              <TextInput
                style={styles.input}
                value={cantidadEliminar}
                onChangeText={setCantidadEliminar}
                placeholder="Ej: 2"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity 
              style={[styles.btn, styles.btnDanger, actionLoading && styles.btnDisabled]}
              onPress={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Eliminar</Text>}
            </TouchableOpacity>
          </View>

          {/* Card 4: Vista Detallada de Espacios (Mapa) */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Mapa de Espacios 🗺️</Text>
            
            {(['CARRO', 'MOTO', 'BICICLETA'] as const).map((tipo) => (
              <View key={tipo} style={styles.typeSection}>
                <Text style={styles.typeHeader}>{tipo}</Text>
                <View style={styles.grid}>
                  {espacios
                    .filter((e) => e.tipoVehiculoPermitido === tipo)
                    .map((espacio) => (
                      <TouchableOpacity
                        key={espacio.codigo}
                        style={[
                          styles.spaceBox,
                          espacio.estado === 'DISPONIBLE' ? styles.spaceAvailable : styles.spaceOccupied,
                        ]}
                        onPress={() => Alert.alert('Espacio', `Código: ${espacio.codigo}\nEstado: ${espacio.estado}\nTarifa: $${espacio.tarifaBase}`)}
                      >
                        <Text style={styles.spaceCode}>{espacio.codigo.split('-').pop()}</Text>
                        {espacio.estado === 'OCUPADO' && <Text style={styles.spaceIcon}>🚗</Text>}
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            ))}
            
            {espacios.length === 0 && !loading && (
              <Text style={styles.emptyText}>No hay espacios configurados.</Text>
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
  summaryTable: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  cellType: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cellValue: {
    flex: 1,
    fontSize: 15,
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
  row: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
  },
  optionSelectedDelete: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnPrimary: {
    backgroundColor: '#007AFF',
  },
  btnDanger: {
    backgroundColor: '#FF3B30',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeSection: {
    marginBottom: 20,
  },
  typeHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  spaceBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  spaceAvailable: {
    backgroundColor: '#E8F5E9',
    borderColor: '#28a745',
  },
  spaceOccupied: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  spaceCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  spaceIcon: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 14,
  },
});

export default SpaceManagementScreen;
