import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

// Interfaces basadas en la documentación del YAML
interface Vehiculo {
  id: number;
  placa: string;
  tipo: string;
}

interface Espacio {
  id: number;
  codigo: string;
}

interface TicketDTO {
  id: number;
  codigo: string;
  vehiculo: Vehiculo;
  espacio?: Espacio;
  horaEntrada: string;
  estado: string;
  tipoTarifa: string;
}

const TicketsScreen = () => {
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/api/parqueadero/tickets/activos');
      setTickets(response.data);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      Alert.alert('Error', 'No se pudieron cargar los tickets activos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Se ejecuta cada vez que la pantalla gana el foco (por ejemplo, al volver de registrar una entrada/salida)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTickets();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-CO');
  };

  const renderItem = ({ item }: { item: TicketDTO }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.placaText}>{item.vehiculo?.placa || 'N/A'}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{item.estado}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ticket:</Text>
          <Text style={styles.value}>{item.codigo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vehículo:</Text>
          <Text style={styles.value}>{item.vehiculo?.tipo || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Espacio:</Text>
          <Text style={styles.value}>{item.espacio?.codigo || 'Sin Asignar'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>F. Tarifa:</Text>
          <Text style={styles.value}>{item.tipoTarifa?.replace('POR_', '') || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Entrada:</Text>
          <Text style={styles.value}>{formatearFecha(item.horaEntrada)}</Text>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando tickets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={styles.emptyText}>No hay vehículos parqueados actualmente.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  placaText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  badgeContainer: {
    backgroundColor: '#E8F5E9', // Verde claro
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  badgeText: {
    color: '#2E7D32', // Verde oscuro
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: 70,
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TicketsScreen;
