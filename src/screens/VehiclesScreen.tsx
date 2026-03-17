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

interface Vehiculo {
  id?: number;
  placa: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  nombrePropietario?: string;
  telefonoPropietario?: string;
}

const VehiclesScreen = () => {
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchPlaca, setSearchPlaca] = useState('');
  const [newPlaca, setNewPlaca] = useState('');
  const [newTipo, setNewTipo] = useState<'CARRO' | 'MOTO' | 'CAMION' | 'BICICLETA'>('CARRO');
  const [newMarca, setNewMarca] = useState('');
  const [newModelo, setNewModelo] = useState('');
  const [newNombrePropietario, setNewNombrePropietario] = useState('');
  const [newTelefonoPropietario, setNewTelefonoPropietario] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  const loadVehicles = async (query = '') => {
    try {
      setLoading(true);
      let url = '/api/vehiculos';
      if (query.trim()) {
        url += `?placa=${query.trim().toUpperCase()}`;
      }
      const response = await api.get(url);
      setVehicles(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los vehículos.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVehicles(searchPlaca);
    }, [])
  );

  const handleSearch = () => {
    loadVehicles(searchPlaca);
  };

  const addVehicle = async () => {
    if (!newPlaca.trim()) {
      Alert.alert('Error', 'Por favor ingresa la placa.');
      return;
    }

    try {
      setActionLoading(true);
      const vehicleData = {
        placa: newPlaca.trim().toUpperCase(),
        tipo: newTipo,
        marca: newMarca,
        modelo: newModelo,
        nombrePropietario: newNombrePropietario,
        telefonoPropietario: newTelefonoPropietario,
      };

      await api.post('/api/vehiculos', vehicleData);
      
      Alert.alert('Éxito', 'Vehículo registrado con éxito.');
      setNewPlaca('');
      setNewMarca('');
      setNewModelo('');
      setNewNombrePropietario('');
      setNewTelefonoPropietario('');
      setShowAddForm(false);
      loadVehicles(searchPlaca);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar el vehículo.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenContainer scrollable={true}>
        <View style={styles.header}>
          <AppText type="black" size={32}>Gestión de</AppText>
          <AppText type="black" size={32} color="primary">Vehículos</AppText>
        </View>

        <GlassCard style={styles.searchCard}>
          <AppText type="bold" size={12} color="textSecondary" style={styles.sectionLabel}>
            BUSCAR POR PLACA
          </AppText>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={searchPlaca}
              onChangeText={setSearchPlaca}
              placeholder="Ej: AAA-123"
              placeholderTextColor={theme.colors.textDimmed}
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={handleSearch}
              activeOpacity={0.7}
            >
              <AppText size={20}>🔍</AppText>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.addBtn, showAddForm && styles.addBtnActive]} 
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <AppText type="bold" color={showAddForm ? 'error' : 'primary'}>
            {showAddForm ? '✕ Cancelar Registro' : '➕ Nuevo Vehículo'}
          </AppText>
        </TouchableOpacity>

        {showAddForm && (
          <GlassCard style={styles.formCard}>
            <AppText type="bold" size={18} style={{ marginBottom: 16 }}>Datos del Vehículo</AppText>
            
            <View style={styles.inputGroup}>
              <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>PLACA</AppText>
              <TextInput
                style={styles.input}
                value={newPlaca}
                onChangeText={setNewPlaca}
                placeholder="ABC-123"
                placeholderTextColor={theme.colors.textDimmed}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>TIPO</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                {(['CARRO', 'MOTO', 'CAMION', 'BICICLETA'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.7}
                    style={[styles.optionButton, newTipo === t && styles.optionSelected]}
                    onPress={() => setNewTipo(t)}
                  >
                    <AppText type="bold" size={11} color={newTipo === t ? 'text' : 'textDimmed'}>
                      {t}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>MARCA</AppText>
                <TextInput
                  style={styles.input}
                  value={newMarca}
                  onChangeText={setNewMarca}
                  placeholder="Toyota"
                  placeholderTextColor={theme.colors.textDimmed}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>MODELO</AppText>
                <TextInput
                  style={styles.input}
                  value={newModelo}
                  onChangeText={setNewModelo}
                  placeholder="2024"
                  placeholderTextColor={theme.colors.textDimmed}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>PROPIETARIO</AppText>
              <TextInput
                style={styles.input}
                value={newNombrePropietario}
                onChangeText={setNewNombrePropietario}
                placeholder="Nombre completo"
                placeholderTextColor={theme.colors.textDimmed}
              />
            </View>

            <PrimaryButton
              title="GUARDAR VEHÍCULO"
              onPress={addVehicle}
              isLoading={actionLoading}
              style={{ marginTop: 8 }}
            />
          </GlassCard>
        )}

        <View style={styles.listSection}>
          <AppText type="bold" size={18} style={styles.listTitle}>
            Vehículos Registrados
          </AppText>
          
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : vehicles.length === 0 ? (
            <AppText color="textDimmed" align="center" style={{ marginTop: 20 }}>
              No se encontraron vehículos.
            </AppText>
          ) : (
            vehicles.map((v, index) => (
              <GlassCard key={v.id || index} style={styles.vehicleItem}>
                <View style={styles.vehicleHeader}>
                  <View>
                    <AppText type="black" size={20}>{v.placa}</AppText>
                    <View style={styles.typeBadge}>
                      <AppText type="bold" size={10} color="primary">{v.tipo}</AppText>
                    </View>
                  </View>
                  <AppText type="semiBold" size={12} color="textDimmed">ID: {v.id}</AppText>
                </View>
                
                {(v.marca || v.nombrePropietario) && (
                  <View style={styles.vehicleDetails}>
                    <AppText size={13} color="textSecondary">
                      {v.marca} {v.modelo}
                    </AppText>
                    {v.nombrePropietario && (
                      <AppText size={12} color="textDimmed" style={{ marginTop: 2 }}>
                        👤 {v.nombrePropietario}
                      </AppText>
                    )}
                  </View>
                )}
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
    gap: 10,
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
  addBtn: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
    marginBottom: theme.spacing.md,
  },
  addBtnActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  formCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  listSection: {
    marginTop: theme.spacing.md,
  },
  listTitle: {
    marginBottom: 16,
  },
  vehicleItem: {
    marginBottom: 12,
    padding: theme.spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeBadge: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  vehicleDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default VehiclesScreen;
