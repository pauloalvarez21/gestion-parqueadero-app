export const theme = {
  colors: {
    // Base colors (Obsidian/Dark Palette)
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceLight: '#262626',
    
    // Brand colors (Electric Blue)
    primary: '#00A3FF',
    primaryDark: '#007ACC',
    primaryLight: '#33B5FF',
    
    // UI elements
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textDimmed: '#666666',
    border: '#333333',
    
    // Feedback
    success: '#00E676',
    error: '#FF3D00',
    warning: '#FFC400',
    info: '#00B0FF',
    
    // Transparencies (Glassmorphism)
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  fonts: {
    black: 'Inter-Black',
    extraBold: 'Inter-ExtraBold',
    bold: 'Inter-Bold',
    semiBold: 'Inter-SemiBold',
    medium: 'Inter-Medium',
    regular: 'Inter-Regular',
    light: 'Inter-Light',
    extraLight: 'Inter-ExtraLight',
    thin: 'Inter-Thin',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  }
};

export type AppTheme = typeof theme;
