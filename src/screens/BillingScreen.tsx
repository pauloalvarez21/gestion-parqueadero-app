import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import useModal from '../hooks/useModal';

interface ResolucionFacturaDTO {
  numeroResolucion?: string;
  fechaResolucion?: string;
  prefijo?: string;
  numeroDesde?: number;
  numeroHasta?: number;
  numeroActual?: number;
  fechaInicio?: string;
  fechaFin?: string;
  activa?: boolean;
  mensajePiePagina?: string;
}

const BillingScreen = () => {
  const { ModalComponent, showSuccess, showError, showInfo, showWarning } = useModal();
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const [resolucion, setResolucion] = useState<ResolucionFacturaDTO | null>(null);

  const [numeroResolucion, setNumeroResolucion] = useState('');
  const [fechaResolucion, setFechaResolucion] = useState('');
  const [prefijo, setPrefijo] = useState('');
  const [numeroDesde, setNumeroDesde] = useState('');
  const [numeroHasta, setNumeroHasta] = useState('');
  const [numeroActual, setNumeroActual] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mensajePiePagina, setMensajePiePagina] = useState('');

  const fetchResolucionActiva = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/parqueadero/facturacion/resolucion/activa');
      const data = response.data;
      setResolucion(data);

      if (data) {
        setNumeroResolucion(data.numeroResolucion || '');
        setFechaResolucion(data.fechaResolucion?.split('T')[0] || '');
        setPrefijo(data.prefijo || '');
        setNumeroDesde(data.numeroDesde?.toString() || '');
        setNumeroHasta(data.numeroHasta?.toString() || '');
        setNumeroActual(data.numeroActual?.toString() || '');
        setFechaInicio(data.fechaInicio?.split('T')[0] || '');
        setFechaFin(data.fechaFin?.split('T')[0] || '');
        setMensajePiePagina(data.mensajePiePagina || '');
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        showError('Error', 'No se pudo cargar la resolución activa.');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchResolucionActiva();
    }, [])
  );

  const handleGuardarResolucion = async () => {
    if (!numeroResolucion.trim() || !prefijo.trim()) {
      showError('Error', 'Número de resolución y prefijo son obligatorios.');
      return;
    }

    try {
      setLoadingConfig(true);
      const resolucionData: ResolucionFacturaDTO = {
        numeroResolucion: numeroResolucion.trim(),
        fechaResolucion: fechaResolucion || undefined,
        prefijo: prefijo.trim(),
        numeroDesde: numeroDesde ? parseInt(numeroDesde) : undefined,
        numeroHasta: numeroHasta ? parseInt(numeroHasta) : undefined,
        numeroActual: numeroActual ? parseInt(numeroActual) : 1,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        mensajePiePagina: mensajePiePagina || undefined,
      };

      await api.post('/api/parqueadero/facturacion/resolucion', resolucionData);

      showSuccess('Éxito', 'Resolución de facturación configurada correctamente.');
      fetchResolucionActiva();
    } catch (error: any) {
      showError('Error', error.response?.data?.message || 'Error al guardar la resolución.');
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleLimpiar = () => {
    setNumeroResolucion('');
    setFechaResolucion('');
    setPrefijo('');
    setNumeroDesde('');
    setNumeroHasta('');
    setNumeroActual('');
    setFechaInicio('');
    setFechaFin('');
    setMensajePiePagina('');
    setResolucion(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {ModalComponent}
      <ScreenContainer scrollable={true}>
        <View style={styles.header}>
          <AppText type="black" size={32}>Resolución</AppText>
          <AppText type="black" size={32} color="primary">DIAN</AppText>
          <AppText color="textSecondary" style={{ marginTop: 4 }}>
            Configuración de facturación electrónica
          </AppText>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        ) : (
          <>
            {resolucion && (
              <GlassCard style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <AppText type="bold" size={14}>Resolución Activa</AppText>
                  <View style={styles.activeBadge}>
                    <AppText type="bold" size={10} color="success">ACTIVA</AppText>
                  </View>
                </View>
                <View style={styles.statusContent}>
                  <AppText size={12} color="textSecondary">
                    Resolución: <AppText type="bold" color="text">{resolucion.numeroResolucion}</AppText>
                  </AppText>
                  <AppText size={12} color="textSecondary">
                    Prefijo: <AppText type="bold" color="text">{resolucion.prefijo}</AppText>
                  </AppText>
                  <AppText size={12} color="textSecondary">
                    Rango: <AppText type="bold" color="text">{resolucion.numeroDesde} - {resolucion.numeroHasta}</AppText>
                  </AppText>
                  <AppText size={12} color="textSecondary">
                    Actual: <AppText type="bold" color="primary">{resolucion.numeroActual}</AppText>
                  </AppText>
                </View>
              </GlassCard>
            )}

            <GlassCard style={styles.formCard}>
              <AppText type="bold" size={16} style={{ marginBottom: 16 }}>
                {resolucion ? 'Actualizar Resolución' : 'Nueva Resolución'}
              </AppText>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                  <AppText type="semiBold" size={14} color="textSecondary" style={styles.label}>
                    DATOS DE LA RESOLUCIÓN
                  </AppText>
                  
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                        NÚMERO RESOLUCIÓN *
                      </AppText>
                      <TextInput
                        style={styles.input}
                        value={numeroResolucion}
                        onChangeText={setNumeroResolucion}
                        placeholder="Ej: 187600000001"
                        placeholderTextColor={theme.colors.textDimmed}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                        FECHA RESOLUCIÓN
                      </AppText>
                      <TextInput
                        style={styles.input}
                        value={fechaResolucion}
                        onChangeText={setFechaResolucion}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.colors.textDimmed}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                      PREFIJO FACTURA *
                    </AppText>
                    <TextInput
                      style={styles.input}
                      value={prefijo}
                      onChangeText={setPrefijo}
                      placeholder="Ej: FC"
                      placeholderTextColor={theme.colors.textDimmed}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                        NÚMERO DESDE
                      </AppText>
                      <TextInput
                        style={styles.input}
                        value={numeroDesde}
                        onChangeText={setNumeroDesde}
                        placeholder="1"
                        placeholderTextColor={theme.colors.textDimmed}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                        NÚMERO HASTA
                      </AppText>
                      <TextInput
                        style={styles.input}
                        value={numeroHasta}
                        onChangeText={setNumeroHasta}
                        placeholder="10000"
                        placeholderTextColor={theme.colors.textDimmed}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                        NÚMERO ACTUAL
                      </AppText>
                      <TextInput
                        style={styles.input}
                        value={numeroActual}
                        onChangeText={setNumeroActual}
                        placeholder="1"
                        placeholderTextColor={theme.colors.textDimmed}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                        FECHA INICIO
                      </AppText>
                      <TextInput
                        style={styles.input}
                        value={fechaInicio}
                        onChangeText={setFechaInicio}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.colors.textDimmed}
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                        FECHA FIN
                      </AppText>
                      <TextInput
                        style={styles.input}
                        value={fechaFin}
                        onChangeText={setFechaFin}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.colors.textDimmed}
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <AppText type="semiBold" size={11} color="textSecondary" style={styles.label}>
                        MENSAJE PIE PÁGINA
                      </AppText>
                      <TextInput
                        style={styles.input}
                        value={mensajePiePagina}
                        onChangeText={setMensajePiePagina}
                        placeholder="Texto opcional"
                        placeholderTextColor={theme.colors.textDimmed}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleLimpiar}
                    activeOpacity={0.7}
                  >
                    <AppText type="bold" size={12} color="textSecondary">LIMPIAR</AppText>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <PrimaryButton
                      title="GUARDAR RESOLUCIÓN"
                      onPress={handleGuardarResolucion}
                      isLoading={loadingConfig}
                    />
                  </View>
                </View>
              </ScrollView>
            </GlassCard>

            <GlassCard style={styles.infoCard}>
              <AppText size={12} color="textSecondary" align="center">
                📋 Los campos marcados con * son obligatorios según la normativa DIAN.
              </AppText>
            </GlassCard>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.xl,
  },
  center: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  statusContent: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    gap: 6,
  },
  formCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
});

export default BillingScreen;
