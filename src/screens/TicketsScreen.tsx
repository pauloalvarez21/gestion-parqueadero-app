import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';
import useModal from '../hooks/useModal';

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
  horaSalida?: string;
  estado: string;
  tipoTarifa: string;
  valorBase?: number;
  valorTotal?: number;
  creadoPor?: string;
  finalizadoPor?: string;
  observaciones?: string;
}

const TicketsScreen = () => {
  const { ModalComponent, showSuccess, showError, showInfo, showWarning } = useModal();
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchCodigo, setSearchCodigo] = useState('');
  const [ticketSeleccionado, setTicketSeleccionado] = useState<TicketDTO | null>(null);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/api/parqueadero/tickets/activos');
      setTickets(response.data);
    } catch (error: any) {
      showError('Error', 'No se pudieron cargar los tickets activos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const buscarTicketPorCodigo = async () => {
    if (!searchCodigo.trim()) {
      showInfo('Aviso', 'Ingresa el código del ticket a buscar.');
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/api/parqueadero/tickets/${searchCodigo.trim()}`);
      setTicketSeleccionado(response.data);
      setTickets([]);
    } catch (error: any) {
      if (error.response?.status === 404) {
        showInfo('No encontrado', 'No existe un ticket con ese código.');
        setTicketSeleccionado(null);
        fetchTickets();
      } else {
        showError('Error', 'No se pudo buscar el ticket');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiarBusqueda = () => {
    setSearchCodigo('');
    setTicketSeleccionado(null);
    fetchTickets();
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
      {ModalComponent}
      <View style={styles.header}>
        <AppText type="black" size={32}>Tickets</AppText>
        <AppText type="black" size={32} color="primary">Activos</AppText>
        <AppText color="textSecondary" style={{ marginTop: 4 }}>
          {ticketSeleccionado ? 'Ticket encontrado' : `${tickets.length} vehículos en el parqueadero`}
        </AppText>
      </View>

      <GlassCard style={styles.searchCard}>
        <AppText type="bold" size={12} color="textSecondary" style={styles.sectionLabel}>
          BUSCAR POR CÓDIGO
        </AppText>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchCodigo}
            onChangeText={setSearchCodigo}
            placeholder="Ej: TKT-123456"
            placeholderTextColor={theme.colors.textDimmed}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={buscarTicketPorCodigo}
            activeOpacity={0.7}
          >
            <AppText size={20}>🔍</AppText>
          </TouchableOpacity>
          {(searchCodigo || ticketSeleccionado) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleLimpiarBusqueda}
              activeOpacity={0.7}
            >
              <AppText size={18}>✕</AppText>
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>

      {ticketSeleccionado && (
        <GlassCard style={styles.selectedTicketCard}>
          <View style={styles.selectedHeader}>
            <AppText type="bold" size={14} color="primary">TICKET ENCONTRADO</AppText>
            <View style={styles.statusBadge}>
              <AppText type="bold" size={10} color={ticketSeleccionado.estado === 'ACTIVO' ? 'success' : 'text'}>
                {ticketSeleccionado.estado}
              </AppText>
            </View>
          </View>
          <View style={styles.selectedContent}>
            <View style={styles.infoRow}>
              <AppText size={12} color="textSecondary">PLACA:</AppText>
              <AppText type="bold" size={14}>{ticketSeleccionado.vehiculo?.placa}</AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText size={12} color="textSecondary">CÓDIGO:</AppText>
              <AppText type="bold" size={14}>{ticketSeleccionado.codigo}</AppText>
            </View>
            <View style={styles.infoRow}>
              <AppText size={12} color="textSecondary">ENTRADA:</AppText>
              <AppText type="bold" size={14}>{formatearFecha(ticketSeleccionado.horaEntrada)}</AppText>
            </View>
            {ticketSeleccionado.espacio && (
              <View style={styles.infoRow}>
                <AppText size={12} color="textSecondary">ESPACIO:</AppText>
                <AppText type="bold" size={14} color="primary">{ticketSeleccionado.espacio.codigo}</AppText>
              </View>
            )}
            {ticketSeleccionado.valorTotal !== undefined && ticketSeleccionado.valorTotal !== null && (
              <View style={styles.infoRow}>
                <AppText size={12} color="textSecondary">VALOR:</AppText>
                <AppText type="bold" size={14} color="success">${ticketSeleccionado.valorTotal.toLocaleString()}</AppText>
              </View>
            )}
          </View>
        </GlassCard>
      )}

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
  searchCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    marginBottom: 8,
    letterSpacing: 1,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchButton: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearButton: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedTicketCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedContent: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
