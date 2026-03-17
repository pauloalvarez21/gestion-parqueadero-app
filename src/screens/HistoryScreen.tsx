import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';

interface HistorialDTO {
  id: number;
  placaVehiculo: string;
  codigoEspacio: string;
  horaEntrada: string;
  horaSalida: string;
  duracionMinutos: number;
  valorTotal: number;
  fechaRegistro: string;
  creadoPor: string;
  finalizadoPor: string;
}

const HistoryScreen = () => {
  const [history, setHistory] = useState<HistorialDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/parqueadero/historial');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderItem = ({ item }: { item: HistorialDTO }) => (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.placaBadge}>
          <AppText type="black" size={16} color="primary">{item.placaVehiculo}</AppText>
        </View>
        <AppText type="black" size={18} color="success">{formatCurrency(item.valorTotal)}</AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <AppText type="semiBold" size={10} color="textDimmed">ENTRADA</AppText>
          <AppText size={12}>{formatDate(item.horaEntrada)}</AppText>
        </View>
        <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
          <AppText type="semiBold" size={10} color="textDimmed">SALIDA</AppText>
          <AppText size={12}>{formatDate(item.horaSalida)}</AppText>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <AppText type="semiBold" size={10} color="textDimmed">DURACIÓN</AppText>
          <AppText size={12}>{item.duracionMinutos} min</AppText>
        </View>
        <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
          <AppText type="semiBold" size={10} color="textDimmed">ESPACIO</AppText>
          <AppText size={12}>{item.codigoEspacio}</AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.userSection}>
        <AppText size={10} color="textDimmed">
          Atendido por: <AppText size={10} type="bold">{item.creadoPor}</AppText> → <AppText size={10} type="bold">{item.finalizadoPor}</AppText>
        </AppText>
      </View>
    </GlassCard>
  );

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <AppText type="black" size={32}>Historial de</AppText>
        <AppText type="black" size={32} color="primary">Tickets</AppText>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText size={16} color="textDimmed">No hay registros en el historial.</AppText>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  placaBadge: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
    opacity: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
  },
  userSection: {
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
});

export default HistoryScreen;
