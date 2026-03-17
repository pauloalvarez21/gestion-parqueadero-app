import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';

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
  creadoPor?: string;
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
      Alert.alert('Error', 'No se pudieron cargar los tickets activos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  const renderItem = ({ item }: { item: TicketDTO }) => (
    <GlassCard style={styles.ticketCard}>
      <View style={styles.cardHeader}>
        <View>
          <AppText type="black" size={24}>{item.vehiculo?.placa || 'N/A'}</AppText>
          <View style={styles.typeBadge}>
            <AppText type="bold" size={10} color="primary">{item.vehiculo?.tipo}</AppText>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <AppText type="bold" size={10} color="success">{item.estado}</AppText>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <AppText type="semiBold" size={11} color="textDimmed">TICKET</AppText>
            <AppText type="bold" size={13}>{item.codigo}</AppText>
          </View>
          <View style={styles.infoItem}>
            <AppText type="semiBold" size={11} color="textDimmed">ESPACIO</AppText>
            <AppText type="bold" size={13} color="primary">{item.espacio?.codigo || 'SIN ASIGNAR'}</AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <AppText type="semiBold" size={11} color="textDimmed">TARIFA</AppText>
            <AppText type="bold" size={13}>{item.tipoTarifa?.replace('POR_', '') || 'N/A'}</AppText>
          </View>
          <View style={styles.infoItem}>
            <AppText type="semiBold" size={11} color="textDimmed">ENTRADA</AppText>
            <AppText type="bold" size={13}>{formatearFecha(item.horaEntrada)}</AppText>
          </View>
        </View>

        {item.creadoPor && (
          <>
            <View style={styles.divider} />
            <AppText size={10} color="textDimmed">
              Ingresado por: <AppText size={10} type="bold">{item.creadoPor}</AppText>
            </AppText>
          </>
        )}
      </View>
    </GlassCard>
  );

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <AppText type="black" size={32}>Tickets</AppText>
        <AppText type="black" size={32} color="primary">Activos</AppText>
        <AppText color="textSecondary" style={{ marginTop: 4 }}>
          {tickets.length} vehículos en el parqueadero
        </AppText>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText size={60} style={{ marginBottom: 16 }}>🎫</AppText>
            <AppText type="bold" size={18} align="center">No hay vehículos activos</AppText>
            <AppText color="textDimmed" align="center" style={{ marginTop: 8 }}>
              Parece que el parqueadero está vacío ahora mismo.
            </AppText>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  listContainer: {
    paddingBottom: 40,
  },
  ticketCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  cardBody: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10,
    opacity: 0.5,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
});

export default TicketsScreen;
