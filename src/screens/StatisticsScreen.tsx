import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';

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

  const occupancyRate = stats ? (stats.espaciosOcupados / (stats.espaciosDisponibles + stats.espaciosOcupados)) : 0;

  return (
    <ScreenContainer 
      scrollable={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      <View style={styles.header}>
        <AppText type="black" size={32}>Panel de</AppText>
        <AppText type="black" size={32} color="primary">Control</AppText>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.statsContainer}>
          {/* Ocupación Principal */}
          <GlassCard style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <AppText type="bold" size={16}>Ocupación Actual</AppText>
              <AppText type="black" color="primary" size={20}>{Math.round(occupancyRate * 100)}%</AppText>
            </View>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${occupancyRate * 100}%`,
                    backgroundColor: occupancyRate > 0.8 ? theme.colors.error : theme.colors.primary
                  }
                ]} 
              />
            </View>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <AppText type="bold" size={18} color="success">{stats?.espaciosDisponibles}</AppText>
                <AppText size={11} color="textDimmed">LIBRES</AppText>
              </View>
              <View style={styles.detailItem}>
                <AppText type="bold" size={18} color="error">{stats?.espaciosOcupados}</AppText>
                <AppText size={11} color="textDimmed">OCUPADOS</AppText>
              </View>
              <View style={styles.detailItem}>
                <AppText type="bold" size={18}>{stats?.vehiculosActivos}</AppText>
                <AppText size={11} color="textDimmed">EN PLAYA</AppText>
              </View>
            </View>
          </GlassCard>

          <View style={styles.grid}>
            <GlassCard style={styles.gridItem}>
              <AppText type="bold" size={12} color="textDimmed" style={styles.gridLabel}>INGRESOS HOY</AppText>
              <AppText type="black" size={18} color="success">{formatCurrency(stats?.ingresosHoy || 0)}</AppText>
            </GlassCard>
            <View style={{ width: 12 }} />
            <GlassCard style={styles.gridItem}>
              <AppText type="bold" size={12} color="textDimmed" style={styles.gridLabel}>TICKETS HOY</AppText>
              <AppText type="black" size={18}>{stats?.ticketsHoy || 0}</AppText>
            </GlassCard>
          </View>

          <GlassCard style={styles.monthCard}>
            <AppText type="bold" size={14} color="textSecondary" style={{ marginBottom: 8 }}>RESUMEN MENSUAL</AppText>
            <View style={styles.monthRow}>
              <View>
                <AppText size={11} color="textDimmed">TOTAL INGRESOS</AppText>
                <AppText type="black" size={24}>{formatCurrency(stats?.ingresosMes || 0)}</AppText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AppText size={11} color="textDimmed">TOTAL TICKETS</AppText>
                <AppText type="black" size={24}>{stats?.ticketsMes || 0}</AppText>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.infoCard}>
            <AppText size={13} color="textSecondary" align="center">
              Desliza hacia abajo para actualizar los datos en tiempo real.
            </AppText>
          </GlassCard>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  center: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    gap: 12,
  },
  mainCard: {
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
  },
  gridItem: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  gridLabel: {
    marginBottom: 4,
  },
  monthCard: {
    padding: 20,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
});

export default StatisticsScreen;
