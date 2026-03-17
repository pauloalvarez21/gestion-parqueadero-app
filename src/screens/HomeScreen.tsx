import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { MENU_OPTIONS } from '../config/menuConfig';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { GlassCard } from '../components/GlassCard';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { logout, user, role } = useAuthStore();

  const menuItems = MENU_OPTIONS.filter((item) => 
    item.roles.includes(role || '')
  );

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  const handlePressOption = (item: typeof MENU_OPTIONS[0]) => {
    try {
      navigation.navigate(item.route);
    } catch (error) {
      Alert.alert('Aviso', `La pantalla "${item.title}" aún no está configurada.`);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText type="bold" size={24}>Hola, {user}</AppText>
          <View style={styles.roleBadge}>
            <AppText type="semiBold" size={10} color="primary">{role}</AppText>
          </View>
        </View>
        <Image 
          source={require('../../assets/images/splash_logo.png')} 
          style={styles.smallLogo}
          resizeMode="contain"
        />
      </View>

      <AppText type="semiBold" color="textSecondary" style={styles.sectionTitle}>
        Panel de Control
      </AppText>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppText color="textDimmed" align="center" style={{ marginTop: 40 }}>
            No tienes permisos asignados.
          </AppText>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7}
            style={styles.cardContainer}
            onPress={() => handlePressOption(item)}
          >
            <GlassCard style={styles.card}>
              <View style={styles.iconContainer}>
                <AppText size={32}>{item.icon}</AppText>
              </View>
              <AppText type="bold" size={14} align="center" style={styles.cardTitle}>
                {item.title}
              </AppText>
            </GlassCard>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <AppText type="bold" color="error">Cerrar Sesión</AppText>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  roleBadge: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
  },
  smallLogo: {
    width: 40,
    height: 40,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  gridContainer: {
    paddingBottom: theme.spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  card: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    marginTop: 4,
  },
  logoutButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default HomeScreen;
