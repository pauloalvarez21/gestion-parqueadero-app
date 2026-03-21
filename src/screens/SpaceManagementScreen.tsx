import React, { useState, useCallback } from 'react';
import {
  View,
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
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import useModal from '../hooks/useModal';

interface EspacioDTO {
  id: number;
  codigo: string;
  tipoVehiculoPermitido: string;
  estado: string;
  tarifaBase: number;
  ocupado: boolean;
}

const SpaceManagementScreen = () => {
  const { ModalComponent, showSuccess, showError, showInfo, showWarning } = useModal();
  const [espacios, setEspacios] = useState<EspacioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [tipoAgregar, setTipoAgregar] = useState<'CARRO' | 'MOTO' | 'CAMION' | 'BICICLETA'>('CARRO');
  const [cantidadAgregar, setCantidadAgregar] = useState('');
  const [tarifaBase, setTarifaBase] = useState('');

  const [tipoEliminar, setTipoEliminar] = useState<'CARRO' | 'MOTO' | 'CAMION' | 'BICICLETA'>('CARRO');
  const [cantidadEliminar, setCantidadEliminar] = useState('');

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/parqueadero/espacios');
      setEspacios(response.data);
    } catch (error: any) {
      showError('Error', 'No se pudieron cargar los espacios.');
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
      showInfo('Aviso', 'Por favor completa los campos.');
      return;
    }
    try {
      setActionLoading(true);
      await api.post('/api/parqueadero/espacios/agregar', {
        tipoVehiculo: tipoAgregar,
        cantidad: parseInt(cantidadAgregar),
        tarifaBase: parseFloat(tarifaBase),
      });
      showSuccess('Éxito', 'Espacios agregados.');
      setCantidadAgregar('');
      setTarifaBase('');
      fetchEspacios();
    } catch (error: any) {
      showError('Error', error.response?.data?.message || 'Error al agregar.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cantidadEliminar) {
      showInfo('Aviso', 'Ingresa la cantidad.');
      return;
    }
    Alert.alert('Confirmar', '¿Eliminar espacios disponibles?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(true);
            await api.delete('/api/parqueadero/espacios/eliminar', {
              data: {
                tipoVehiculo: tipoEliminar,
                cantidad: parseInt(cantidadEliminar),
              }
            });
            showSuccess('Éxito', 'Operación completada.');
            setCantidadEliminar('');
            fetchEspacios();
          } catch (error: any) {
            showError('Error', 'No se pudieron eliminar.');
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  const summary = {
    CARRO: { total: 0, disponible: 0, ocupado: 0 },
    MOTO: { total: 0, disponible: 0, ocupado: 0 },
    CAMION: { total: 0, disponible: 0, ocupado: 0 },
    BICICLETA: { total: 0, disponible: 0, ocupado: 0 },
  };

  espacios.forEach((e) => {
    const type = e.tipoVehiculoPermitido as keyof typeof summary;
    if (summary[type]) {
      summary[type].total++;
      if (e.estado === 'DISPONIBLE') summary[type].disponible++;
      else if (e.estado === 'OCUPADO') summary[type].ocupado++;
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {ModalComponent}
      <ScreenContainer scrollable={true}>
        <View style={styles.header}>
          <AppText type="black" size={32}>Gestión de</AppText>
          <AppText type="black" size={32} color="primary">Espacios</AppText>
        </View>

        <GlassCard style={styles.summaryCard}>
          <AppText type="bold" size={16} style={{ marginBottom: 12 }}>Resumen de Ocupación</AppText>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <AppText type="bold" size={12} color="textDimmed" style={{ flex: 1.5 }}>TIPO</AppText>
              <AppText type="bold" size={12} color="textDimmed" style={styles.headerCell}>DISP</AppText>
              <AppText type="bold" size={12} color="textDimmed" style={styles.headerCell}>OCUP</AppText>
              <AppText type="bold" size={12} color="textDimmed" style={styles.headerCell}>TOTAL</AppText>
            </View>
            {Object.entries(summary).map(([type, counts]) => (
              <View key={type} style={styles.tableRow}>
                <AppText type="semiBold" size={14} style={{ flex: 1.5 }}>{type}</AppText>
                <AppText type="bold" color="success" style={styles.cellValue}>{counts.disponible}</AppText>
                <AppText type="bold" color="error" style={styles.cellValue}>{counts.ocupado}</AppText>
                <AppText type="bold" style={styles.cellValue}>{counts.total}</AppText>
              </View>
            ))}
          </View>
        </GlassCard>

        <View style={styles.actionGrid}>
          <GlassCard style={[styles.actionCard, { flex: 1 }]}>
            <AppText type="bold" size={14} style={{ marginBottom: 12 }}>➕ Agregar</AppText>
            <AppText type="semiBold" size={10} color="textSecondary" style={styles.label}>TIPO</AppText>
            <View style={styles.miniSelector}>
              {(['CARRO', 'MOTO'] as const).map(t => (
                <TouchableOpacity 
                  key={t} 
                  onPress={() => setTipoAgregar(t)}
                  style={[styles.miniOption, tipoAgregar === t && styles.miniOptionActive]}
                >
                  <AppText size={10} type="bold">{t}</AppText>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.miniInput}
              value={cantidadAgregar}
              onChangeText={setCantidadAgregar}
              placeholder="Cant."
              placeholderTextColor={theme.colors.textDimmed}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.miniInput}
              value={tarifaBase}
              onChangeText={setTarifaBase}
              placeholder="Tarifa"
              placeholderTextColor={theme.colors.textDimmed}
              keyboardType="numeric"
            />
            <PrimaryButton title="OK" onPress={handleAggregate} style={styles.miniBtn} />
          </GlassCard>

          <View style={{ width: 12 }} />

          <GlassCard style={[styles.actionCard, { flex: 1 }]}>
            <AppText type="bold" size={14} color="error" style={{ marginBottom: 12 }}>🗑️ Eliminar</AppText>
            <AppText type="semiBold" size={10} color="textSecondary" style={styles.label}>TIPO</AppText>
            <View style={styles.miniSelector}>
              {(['CARRO', 'MOTO'] as const).map(t => (
                <TouchableOpacity 
                  key={t} 
                  onPress={() => setTipoEliminar(t)}
                  style={[styles.miniOption, tipoEliminar === t && styles.miniOptionActiveError]}
                >
                  <AppText size={10} type="bold">{t}</AppText>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.miniInput}
              value={cantidadEliminar}
              onChangeText={setCantidadEliminar}
              placeholder="Cant."
              placeholderTextColor={theme.colors.textDimmed}
              keyboardType="numeric"
            />
            <View style={{ height: 42 }} />
            <PrimaryButton type="danger" title="OK" onPress={handleDelete} style={styles.miniBtn} />
          </GlassCard>
        </View>

        <View style={styles.mapSection}>
          <AppText type="bold" size={18} style={{ marginBottom: 16 }}>Mapa del Parqueadero</AppText>
          {(['CARRO', 'MOTO', 'CAMION', 'BICICLETA'] as const).map((tipo) => {
            const spacesOfType = espacios.filter(e => e.tipoVehiculoPermitido === tipo);
            if (spacesOfType.length === 0) return null;
            return (
              <View key={tipo} style={styles.typeRow}>
                <AppText type="bold" size={12} color="textDimmed" style={styles.typeTitle}>{tipo}</AppText>
                <View style={styles.grid}>
                  {spacesOfType.map((espacio) => (
                    <TouchableOpacity
                      key={espacio.codigo}
                      activeOpacity={0.7}
                      style={[
                        styles.spaceBox,
                        espacio.estado === 'DISPONIBLE' ? styles.spaceAvailable : styles.spaceOccupied,
                      ]}
                      onPress={() => showInfo('Espacio', `${espacio.codigo} - ${espacio.estado}`)}
                    >
                      <AppText type="black" size={10} color={espacio.estado === 'DISPONIBLE' ? 'success' : 'error'}>
                        {espacio.codigo.split('-').pop()}
                      </AppText>
                      {espacio.estado === 'OCUPADO' && <AppText size={12}>🚗</AppText>}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  table: {},
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  cellValue: {
    flex: 1,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  actionCard: {
    padding: 12,
  },
  label: {
    marginBottom: 4,
  },
  miniSelector: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  miniOption: {
    flex: 1,
    paddingVertical: 4,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  miniOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  miniOptionActiveError: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  miniInput: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 4,
    padding: 8,
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  miniBtn: {
    paddingVertical: 8,
  },
  mapSection: {
    marginTop: theme.spacing.md,
  },
  typeRow: {
    marginBottom: 20,
  },
  typeTitle: {
    marginBottom: 8,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spaceBox: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1.5,
  },
  spaceAvailable: {
    borderColor: theme.colors.success,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  spaceOccupied: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
});

export default SpaceManagementScreen;
