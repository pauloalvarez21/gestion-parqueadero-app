import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';
import { AppText } from './AppText';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  type?: 'primary' | 'secondary' | 'danger';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  isLoading,
  disabled,
  style,
  type = 'primary',
}) => {
  const getBackgroundColor = () => {
    if (disabled || isLoading) return theme.colors.surfaceLight;
    switch (type) {
      case 'danger': return theme.colors.error;
      case 'secondary': return theme.colors.surfaceLight;
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled || isLoading) return theme.colors.textDimmed;
    return theme.colors.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <AppText type="bold" color={getTextColor() as any} align="center">
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
