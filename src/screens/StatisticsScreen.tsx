import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

interface EstadisticasDTO {
  vehiculosActivos: number;
  espaciosDisponibles: number;
  espaciosOcupados: number;
  ingresosHoy: number;
  ingresosMes: number;
  ticketsHoy: number;
  ticketsMes: number;
}

const StatisticsScreen = () => {
  const [stats, setStats] = useState<EstadisticasDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/parqueadero/estadisticas');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Panel de Estadísticas 📊</Text>

        {/* Card 1: Ingresos */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ingresos</Text>
          <View style={styles.row}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Hoy</Text>
              <Text style={styles.statValue}>{formatCurrency(stats?.ingresosHoy || 0)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Mes Actual</Text>
              <Text style={[styles.statValue, { color: '#28a745' }]}>
                {formatCurrency(stats?.ingresosMes || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Card 2: Tickets / Movimientos */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tickets Generados</Text>
          <View style={styles.row}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Hoy</Text>
              <Text style={styles.statValue}>{stats?.ticketsHoy || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Mes</Text>
              <Text style={styles.statValue}>{stats?.ticketsMes || 0}</Text>
            </View>
          </View>
        </View>

        {/* Card 3: Estado de Capacidad */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ocupación Actual</Text>
          <View style={styles.occupancyContainer}>
            <View style={styles.occupancyBarContainer}>
              <View 
                style={[
                  styles.occupancyBar, 
                  { 
                    width: `${stats ? (stats.espaciosOcupados / (stats.espaciosDisponibles + stats.espaciosOcupados)) * 100 : 0}%`,
                    backgroundColor: (stats && (stats.espaciosOcupados / (stats.espaciosDisponibles + stats.espaciosOcupados)) > 0.8) ? '#FF3B30' : '#007AFF'
                  }
                ]} 
              />
            </View>
            <View style={styles.row}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Libres</Text>
                <Text style={[styles.statValue, { color: '#28a745' }]}>{stats?.espaciosDisponibles || 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Ocupados</Text>
                <Text style={[styles.statValue, { color: '#FF3B30' }]}>{stats?.espaciosOcupados || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resumen de Vehículos Activos */}
        <View style={[styles.sectionCard, styles.activeVehiclesCard]}>
          <Text style={styles.activeVehiclesText}>
            Vehículos en el parqueadero ahora: <Text style={styles.activeVehiclesCount}>{stats?.vehiculosActivos || 0}</Text>
          </Text>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  occupancyContainer: {
    marginTop: 10,
  },
  occupancyBarContainer: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  occupancyBar: {
    height: '100%',
    borderRadius: 5,
  },
  activeVehiclesCard: {
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    borderWidth: 0,
  },
  activeVehiclesText: {
    fontSize: 15,
    color: '#1976D2',
    fontWeight: '600',
  },
  activeVehiclesCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default StatisticsScreen;
