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

interface TarifaDTO {
  id?: number;
  tipoVehiculo: string;
  tipoTarifa: string;
  valor: number;
}

const TariffsScreen = () => {
  const { ModalComponent, showSuccess, showError, showInfo, showWarning } = useModal();
  const [tarifas, setTarifas] = useState<TarifaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedVehiculo, setSelectedVehiculo] = useState<string>('CARRO');
  const [selectedTipo, setSelectedTipo] = useState<string>('POR_HORA');
  const [valor, setValor] = useState('');

  const fetchTarifas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/parqueadero/tarifas');
      setTarifas(response.data);
    } catch (error: any) {
      showError('Error', 'No se pudieron cargar las tarifas.');
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
      showInfo('Aviso', 'Ingresa un valor válido.');
      return;
    }
    try {
      setActionLoading(true);
      await api.post('/api/parqueadero/tarifas', {
        tipoVehiculo: selectedVehiculo,
        tipoTarifa: selectedTipo,
        valor: parseFloat(valor),
      });
      showSuccess('Éxito', 'Tarifa guardada.');
      setValor('');
      fetchTarifas();
    } catch (error: any) {
      showError('Error', error.response?.data?.message || 'Error al guardar.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTarifa = (tipoVehiculo: string, tipoTarifa: string) => {
    Alert.alert('Confirmar', '¿Eliminar esta tarifa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(true);
            await api.delete(`/api/parqueadero/tarifas/${tipoVehiculo}/${tipoTarifa}`);
            fetchTarifas();
          } catch (error: any) {
            showError('Error', 'No se pudo eliminar.');
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  const tiposVehiculo = ['CARRO', 'MOTO', 'CAMION', 'BICICLETA'];
  const tiposDisponibles = ['POR_MINUTO', 'POR_HORA', 'POR_DIA', 'POR_MES', 'FRACCION'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {ModalComponent}
      <ScreenContainer scrollable={true}>
        <View style={styles.header}>
          <AppText type="black" size={32}>Configurar</AppText>
          <AppText type="black" size={32} color="primary">Tarifas</AppText>
        </View>

        <GlassCard style={styles.formCard}>
          <View style={styles.inputGroup}>
            <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>TIPO VEHÍCULO</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {tiposVehiculo.map((v) => (
                <TouchableOpacity
                  key={v}
                  activeOpacity={0.7}
                  style={[styles.optionButton, selectedVehiculo === v && styles.optionSelected]}
                  onPress={() => setSelectedVehiculo(v)}
                >
                  <AppText type="bold" size={11} color={selectedVehiculo === v ? 'text' : 'textDimmed'}>{v}</AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>PERIODICIDAD</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {tiposDisponibles.map((t) => (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.7}
                  style={[styles.optionButton, selectedTipo === t && styles.optionSelected]}
                  onPress={() => setSelectedTipo(t)}
                >
                  <AppText type="bold" size={11} color={selectedTipo === t ? 'text' : 'textDimmed'}>{t.replace('POR_', '')}</AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>VALOR ($)</AppText>
            <TextInput
              style={styles.input}
              value={valor}
              onChangeText={setValor}
              placeholder="3000"
              placeholderTextColor={theme.colors.textDimmed}
              keyboardType="numeric"
            />
          </View>

          <PrimaryButton
            title="ACTUALIZAR TARIFA"
            onPress={handleSaveTarifa}
            isLoading={actionLoading}
          />
        </GlassCard>

        <View style={styles.listSection}>
          <AppText type="bold" size={18} style={{ marginBottom: 16 }}>Tarifas Vigentes</AppText>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : tarifas.length === 0 ? (
            <AppText color="textDimmed" align="center">No hay tarifas configuradas.</AppText>
          ) : (
            tarifas.map((t, index) => (
              <GlassCard key={index} style={styles.tariffCard}>
                <View style={styles.tariffMain}>
                  <View>
                    <AppText type="black" size={18} color="primary">${t.valor.toLocaleString()}</AppText>
                    <AppText type="bold" size={12} color="textSecondary">
                      {t.tipoVehiculo} • {t.tipoTarifa.replace('POR_', '')}
                    </AppText>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDeleteTarifa(t.tipoVehiculo, t.tipoTarifa)}
                    style={styles.deleteBtn}
                  >
                    <AppText size={18}>🗑️</AppText>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))
          )}
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
  formCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    letterSpacing: 1,
  },
  horizontalScroll: {
    gap: 8,
    paddingRight: 20,
  },
  optionButton: {
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.black,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listSection: {
    marginTop: 10,
  },
  tariffCard: {
    marginBottom: 10,
    padding: 16,
  },
  tariffMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
  },
});

export default TariffsScreen;
