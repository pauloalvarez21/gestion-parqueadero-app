import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

// Interface para listar usuarios (asumida de cómo debería devolver tu API)
interface UsuarioDTO {
  id?: number;
  username: string;
  role?: string;
}

const RegisterUserScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'OPERADOR' | 'ADMIN'>('OPERADOR');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para gestionar usuarios
  const [users, setUsers] = useState<UsuarioDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Cargar usuarios al entrar a la pantalla
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      // Asumimos un endpoint tipo GET /api/auth/users o /api/usuarios
      const response = await api.get('/api/usuarios'); // Actualiza este endpoint exacto de tu API
      setUsers(response.data);
    } catch (error) {
      console.log('No se pudieron cargar los usuarios. Verifica si el endpoint es correcto.', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleDeleteUser = (username: string) => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de que deseas eliminar al usuario "${username}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Endpoint actualizado según YAML: /api/auth/eliminar/{username}
              await api.delete(`/api/auth/eliminar/${username}`); 
              Alert.alert('Éxito', 'Usuario eliminado correctamente.');
              fetchUsers(); // Recargar la lista
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar el usuario.');
            }
          }
        }
      ]
    );
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        username: username.trim(),
        password,
        role: role,
      });

      Alert.alert(
        'Usuario Creado',
        `El usuario "${username}" ha sido registrado correctamente.`,
        [
          { 
            text: 'Aceptar', 
            onPress: () => {
              setUsername('');
              setPassword('');
              setConfirmPassword('');
              fetchUsers(); // Recargamos la lista automáticamente
            } 
          }
        ]
      );
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo registrar el usuario. Es posible que el nombre de usuario ya exista.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Crear Usuario</Text>
            <Text style={styles.subtitle}>Añade un nuevo operador o admin al sistema</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de Usuario</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Ejemplo: operador_juan"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{ fontSize: 20 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite la contraseña"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rol de Usuario</Text>
              <View style={styles.optionsRow}>
                {(['OPERADOR', 'ADMIN'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.optionButton, role === r && styles.optionSelected]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[styles.optionText, role === r && styles.optionTextSelected]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Registrar Usuario ➕</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Segunda Card: Gestionar Usuarios */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.title}>Gestionar Usuarios</Text>
            <Text style={styles.subtitle}>Listado de operadores y administradores</Text>

            {loadingUsers ? (
              <ActivityIndicator color="#007AFF" style={{ marginVertical: 20 }} />
            ) : users.length === 0 ? (
              <Text style={styles.emptyText}>No hay o no se pudieron cargar los usuarios.</Text>
            ) : (
              users.map((u, index) => (
                <View key={u.id?.toString() || index.toString()} style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userNameText}>{u.username}</Text>
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{u.role || 'USUARIO'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteUser(u.username)}
                  >
                    <Text style={styles.deleteButtonText}>✕ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 15,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 15,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badgeContainer: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RegisterUserScreen;
