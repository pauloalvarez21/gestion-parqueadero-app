import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { AppText } from './AppText';
import { theme } from '../theme/theme';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  icon?: string;
  showCloseButton?: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  icon,
  showCloseButton = true,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          borderColor: theme.colors.success,
          bgGradient: 'rgba(52, 199, 89, 0.05)',
          iconBg: 'rgba(52, 199, 89, 0.1)',
          titleColor: theme.colors.success,
          defaultIcon: '✅',
        };
      case 'error':
        return {
          borderColor: theme.colors.error,
          bgGradient: 'rgba(255, 59, 48, 0.05)',
          iconBg: 'rgba(255, 59, 48, 0.1)',
          titleColor: theme.colors.error,
          defaultIcon: '❌',
        };
      case 'warning':
        return {
          borderColor: '#FF9500',
          bgGradient: 'rgba(255, 149, 0, 0.05)',
          iconBg: 'rgba(255, 149, 0, 0.1)',
          titleColor: '#FF9500',
          defaultIcon: '⚠️',
        };
      default:
        return {
          borderColor: theme.colors.primary,
          bgGradient: 'rgba(0, 163, 255, 0.05)',
          iconBg: 'rgba(0, 163, 255, 0.1)',
          titleColor: theme.colors.primary,
          defaultIcon: 'ℹ️',
        };
    }
  };

  const typeStyles = getTypeStyles();
  const displayIcon = icon || typeStyles.defaultIcon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.content,
                  { backgroundColor: typeStyles.bgGradient },
                ]}
              >
                <View style={styles.header}>
                  <View style={[styles.iconContainer, { backgroundColor: typeStyles.iconBg }]}>
                    <AppText size={32}>{displayIcon}</AppText>
                  </View>
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      style={styles.closeButton}
                      activeOpacity={0.7}
                    >
                      <AppText size={24} color="textDimmed">✕</AppText>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.body}>
                  <AppText
                    type="bold"
                    size={20}
                    color={typeStyles.titleColor as keyof typeof theme.colors}
                    style={styles.title}
                  >
                    {title}
                  </AppText>
                  <AppText size={15} color="textSecondary" style={styles.message}>
                    {message}
                  </AppText>
                </View>

                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: typeStyles.titleColor }]}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <AppText type="bold" size={14} color="background">
                      {type === 'error' ? 'ENTENDIDO' : 'ACEPTAR'}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
});

export default CustomModal;
