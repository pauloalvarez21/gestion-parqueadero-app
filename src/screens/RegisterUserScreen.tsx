import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import useModal from '../hooks/useModal';

interface UsuarioDTO {
  id?: number;
  username: string;
  role?: string;
  rol?: string; // Fallback for some backend versions
}

const RegisterUserScreen = () => {
  const { ModalComponent, showSuccess, showError, showInfo, showWarning } = useModal();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'OPERADOR' | 'ADMIN' | 'USER'>('OPERADOR');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState<UsuarioDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/api/usuarios');
      setUsers(response.data);
    } catch (error) {
      console.log('Error al cargar usuarios:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChangeRole = (usernameToChange: string, newRole: 'ADMIN' | 'OPERADOR' | 'USER') => {
    Alert.alert(
      'Confirmar',
      `¿Cambiar el rol de "${usernameToChange}" a ${newRole === 'OPERADOR' ? 'OPERARIO' : newRole === 'ADMIN' ? 'ADMIN' : 'USUARIO'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar',
          onPress: async () => {
            try {
              setChangingRole(usernameToChange);
              await api.put(`/api/usuarios/${usernameToChange}/rol`, {
                newRole,
              });
              showSuccess('Éxito', 'Rol actualizado correctamente.');
              fetchUsers();
            } catch (error: any) {
              showError('Error', error.response?.data?.message || 'No se pudo cambiar el rol.');
            } finally {
              setChangingRole(null);
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleDeleteUser = (usernameToDelete: string) => {
    if (!usernameToDelete) {
      showError('Error', 'No se puede identificar al usuario para eliminar.');
      return;
    }

    Alert.alert('Confirmar', `¿Estás seguro de que deseas eliminar al usuario "${usernameToDelete}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/usuarios/${usernameToDelete}`);
            showSuccess('Éxito', 'Usuario eliminado correctamente.');
            fetchUsers();
          } catch (error: any) {
            console.error('Error al eliminar usuario:', error);
            const msg = error.response?.data?.message || 'No se pudo eliminar el usuario del sistema.';
            showError('Error', msg);
          }
        }
      }
    ]);
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      showError('Error', 'Todos los campos son obligatorios.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Error', 'Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      // Enviamos tanto 'role' como 'rol' para asegurar compatibilidad con el backend
      await api.post('/api/auth/register', {
        username: username.trim(),
        password,
        role: role,
        rol: role,
      });
      showSuccess('Éxito', 'Usuario registrado correctamente.');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      fetchUsers();
    } catch (error: any) {
      showError('Error', error.response?.data?.message || 'Error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {ModalComponent}
      <ScreenContainer scrollable={true}>
        <View style={styles.header}>
          <AppText type="black" size={32}>Gestión de</AppText>
          <AppText type="black" size={32} color="primary">Usuarios</AppText>
        </View>

        <GlassCard style={styles.formCard}>
          <AppText type="bold" size={18} style={{ marginBottom: 16 }}>Nuevo Registro</AppText>
          
          <View style={styles.inputGroup}>
            <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>NOMBRE DE USUARIO</AppText>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Ej: juan_operario"
              placeholderTextColor={theme.colors.textDimmed}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>CONTRASEÑA</AppText>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={theme.colors.textDimmed}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <AppText size={18}>{showPassword ? '🐵' : '🙈'}</AppText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>CONFIRMAR CONTRASEÑA</AppText>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite la contraseña"
                placeholderTextColor={theme.colors.textDimmed}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <AppText type="semiBold" size={12} color="textSecondary" style={styles.label}>ROL ASIGNADO</AppText>
            <View style={styles.roleRow}>
              {(['OPERADOR', 'ADMIN', 'USER'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  activeOpacity={0.7}
                  style={[styles.roleBtn, role === r && styles.roleActive]}
                  onPress={() => setRole(r)}
                >
                  <AppText type="bold" size={10} color={role === r ? 'text' : 'textDimmed'}>
                    {r === 'OPERADOR' ? 'OPERARIO' : r === 'ADMIN' ? 'ADMIN' : 'USUARIO'}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <PrimaryButton
            title="REGISTRAR USUARIO"
            onPress={handleRegister}
            isLoading={loading}
          />
        </GlassCard>

        <View style={styles.listSection}>
          <AppText type="bold" size={18} style={{ marginBottom: 16 }}>Usuarios del Sistema</AppText>
          {loadingUsers ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : users.length === 0 ? (
            <AppText color="textDimmed" align="center">No hay usuarios registrados.</AppText>
          ) : (
            users.map((u, index) => (
              <GlassCard key={index} style={styles.userItem}>
                <View style={styles.userMain}>
                  <View style={styles.userAvatar}>
                    <AppText size={20}>👤</AppText>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText type="bold" size={16}>{u.username}</AppText>
                    <View style={styles.roleRowSmall}>
                      {(['OPERADOR', 'ADMIN', 'USER'] as const).map((r) => (
                        <TouchableOpacity
                          key={r}
                          activeOpacity={0.7}
                          style={[
                            styles.roleBtnSmall,
                            (u.role || u.rol) === r && styles.roleActiveSmall,
                            changingRole === u.username && styles.roleDisabled,
                          ]}
                          onPress={() => handleChangeRole(u.username, r)}
                          disabled={changingRole === u.username}
                        >
                          <AppText type="bold" size={8} color={(u.role || u.rol) === r ? 'text' : 'textDimmed'}>
                            {r === 'OPERADOR' ? 'OPERARIO' : r === 'ADMIN' ? 'ADMIN' : 'USUARIO'}
                          </AppText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteUser(u.username)}
                    style={styles.deleteBtn}
                    disabled={changingRole === u.username}
                  >
                    <AppText size={14} opacity={0.7}>🗑️</AppText>
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
  },
  eyeBtn: {
    paddingHorizontal: 16,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleRowSmall: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  roleBtnSmall: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleActiveSmall: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleDisabled: {
    opacity: 0.5,
  },
  listSection: {
    marginTop: 10,
  },
  userItem: {
    marginBottom: 10,
    padding: 12,
  },
  userMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleBadge: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
  },
});

export default RegisterUserScreen;
