import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';

interface DashboardDTO {
  vehiculosActivos: number;
  espaciosDisponibles: number;
  espaciosOcupados: number;
  ingresosHoy: number;
  ingresosMes: number;
  ticketsHoy: number;
  ticketsMes: number;
}

interface Espacio {
  id: number;
  codigo: string;
  tipoVehiculo: string;
  ocupado: boolean;
}

interface Historial {
  id: number;
  placaVehiculo: string;
  codigoEspacio: string;
  horaEntrada: string;
  horaSalida: string;
  valorTotal: number;
}

const DashboardScreen = () => {
  const [stats, setStats] = useState<DashboardDTO | null>(null);
  const [spaces, setSpaces] = useState<Espacio[]>([]);
  const [history, setHistory] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [statsRes, spacesRes, historyRes] = await Promise.all([
        api.get('/api/parqueadero/estadisticas'),
        api.get('/api/parqueadero/espacios'),
        api.get('/api/parqueadero/historial'),
      ]);

      setStats(statsRes.data);
      setSpaces(spacesRes.data);
      // Sort by entry time descending and take last 8
      const sortedHistory = [...historyRes.data]
        .sort((a, b) => new Date(b.horaEntrada).getTime() - new Date(a.horaEntrada).getTime())
        .slice(0, 8);
      setHistory(sortedHistory);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setErrorMessage('No se pudieron sincronizar los datos del parqueadero.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalSpaces = () => {
    if (!stats) return 0;
    return stats.espaciosOcupados + stats.espaciosDisponibles;
  };

  const getOccupationPercentage = () => {
    if (!stats || getTotalSpaces() === 0) return 0;
    return Math.round((stats.espaciosOcupados / getTotalSpaces()) * 100);
  };

  const today = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  if (loading && !refreshing) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <AppText style={styles.loadingText}>Actualizando dashboard...</AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText type="black" size={28}>Hola, Admin</AppText>
          <AppText type="regular" size={14} color="textSecondary">
            Aquí tienes el estado actual del parqueadero hoy, {today}
          </AppText>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <AppText type="bold" size={14} color="primary">
            {refreshing ? '...' : 'Actualizar'}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Error Alert */}
      {errorMessage ? (
        <GlassCard style={styles.errorCard}>
          <AppText type="bold" size={16} color="error">Ocurrió un error</AppText>
          <AppText size={14} color="textSecondary">{errorMessage}</AppText>
        </GlassCard>
      ) : null}

      {/* Stats Grid */}
      {stats && (
        <>
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <View style={[styles.statIcon, styles.iconPrimary]}>
                <AppText size={24}>🚗</AppText>
              </View>
              <AppText type="black" size={24}>{stats.vehiculosActivos}</AppText>
              <AppText type="bold" size={11} color="textDimmed" style={styles.statLabel}>
                VEHÍCULOS ACTIVOS
              </AppText>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={[styles.statIcon, styles.iconSuccess]}>
                <AppText size={24}>✅</AppText>
              </View>
              <AppText type="black" size={24}>{stats.espaciosDisponibles}</AppText>
              <AppText type="bold" size={11} color="textDimmed" style={styles.statLabel}>
                LIBRES
              </AppText>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={[styles.statIcon, styles.iconWarning]}>
                <AppText size={24}>💰</AppText>
              </View>
              <AppText type="black" size={18}>{formatCurrency(stats.ingresosHoy)}</AppText>
              <AppText type="bold" size={11} color="textDimmed" style={styles.statLabel}>
                INGRESOS HOY
              </AppText>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={[styles.statIcon, styles.iconInfo]}>
                <AppText size={24}>🎫</AppText>
              </View>
              <AppText type="black" size={24}>{stats.ticketsHoy}</AppText>
              <AppText type="bold" size={11} color="textDimmed" style={styles.statLabel}>
                TICKETS HOY
              </AppText>
            </GlassCard>
          </View>

          {/* Main Content Grid */}
          <View style={styles.mainGrid}>
            {/* Occupancy Map */}
            <GlassCard style={styles.mapCard}>
              <View style={styles.cardHeader}>
                <AppText type="bold" size={16}>Mapa de Ocupación</AppText>
                <View style={styles.badge}>
                  <AppText type="bold" size={12}>{getOccupationPercentage()}% Capacidad</AppText>
                </View>
              </View>

              {spaces.length > 0 ? (
                <View style={styles.mapGrid}>
                  {spaces.map((space) => (
                    <View
                      key={space.id}
                      style={[
                        styles.spaceItem,
                        space.ocupado ? styles.spaceOccupied : styles.spaceFree,
                      ]}
                    >
                      <AppText
                        type="bold"
                        size={10}
                        color={space.ocupado ? 'surface' : 'textSecondary'}
                      >
                        {space.codigo}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <AppText type="regular" size={14} color="textDimmed" align="center">
                    No hay espacios configurados aún.
                  </AppText>
                </View>
              )}
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard style={styles.activityCard}>
              <AppText type="bold" size={16} style={styles.activityTitle}>
                Actividad Reciente
              </AppText>

              {history.length > 0 ? (
                <View style={styles.activityFeed}>
                  {history.map((item, index) => (
                    <View key={item.id} style={styles.activityItem}>
                      <View style={styles.activityAvatar}>
                        <AppText size={16}>
                          {item.horaSalida ? '🏁' : '🅿️'}
                        </AppText>
                      </View>
                      <View style={styles.activityDetails}>
                        <AppText type="bold" size={14}>
                          {item.placaVehiculo} - {item.codigoEspacio}
                        </AppText>
                        <AppText type="regular" size={12} color="textDimmed">
                          {formatTime(item.horaSalida || item.horaEntrada)}
                        </AppText>
                      </View>
                      {item.valorTotal > 0 && (
                        <AppText type="bold" size={14} color="success">
                          +{formatCurrency(item.valorTotal)}
                        </AppText>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <AppText type="regular" size={14} color="textDimmed" align="center">
                    No hay actividad reciente registrada.
                  </AppText>
                </View>
              )}
            </GlassCard>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  errorCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: '48%',
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconPrimary: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  iconSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  iconWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  iconInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  statLabel: {
    marginTop: 4,
    letterSpacing: 0.5,
  },
  mainGrid: {
    gap: 12,
  },
  mapCard: {
    padding: theme.spacing.lg,
  },
  activityCard: {
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spaceItem: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceFree: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 2,
    borderColor: theme.colors.textDimmed,
    borderStyle: 'dashed',
  },
  spaceOccupied: {
    backgroundColor: theme.colors.primary,
  },
  activityTitle: {
    marginBottom: theme.spacing.md,
  },
  activityFeed: {
    gap: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
});

export default DashboardScreen;
