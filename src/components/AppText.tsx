import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface AppTextProps extends TextProps {
  type?: keyof typeof theme.fonts;
  color?: keyof typeof theme.colors;
  size?: number;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  style,
  type = 'regular',
  color = 'text',
  size,
  align = 'left',
  ...props
}) => {
  return (
    <Text
      style={[
        {
          fontFamily: theme.fonts[type],
          color: theme.colors[color],
          fontSize: size || 16,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
