import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ 
  children, 
  scrollable = true,
  refreshControl
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {scrollable ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});
