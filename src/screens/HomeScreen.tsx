import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { MENU_OPTIONS } from '../config/menuConfig';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { logout, user, role } = useAuthStore();

  // 2. Filtrar opciones según el rol del usuario actual
  const menuItems = MENU_OPTIONS.filter((item) => 
    item.roles.includes(role || '')
  );

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  const handlePressOption = (item: typeof MENU_OPTIONS[0]) => {
    // Intentamos navegar. Si la ruta no está registrada en AppNavigator, fallará (o no hará nada).
    try {
      navigation.navigate(item.route);
    } catch (error) {
      Alert.alert('Aviso', `La pantalla "${item.title}" aún no está configurada en la navegación.`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hola, {user}</Text>
        <Text style={styles.subtitle}>Rol: {role}</Text>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes permisos asignados.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => handlePressOption(item)}
          >
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  gridContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    width: '48%', // Casi la mitad para que entren 2 por fila
    aspectRatio: 1.1, // Un poco más alto que ancho o cuadrado
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    elevation: 4, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 10,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
