import React from 'react';
import { useState, useCallback, useRef } from 'react';
import CustomModal from '../components/CustomModal';

interface UseModalResult {
  ModalComponent: React.ReactNode;
  showModal: (params: ShowModalParams) => void;
  hideModal: () => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
}

interface ShowModalParams {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  icon?: string;
  onClose?: () => void;
}

export const useModal = (): UseModalResult => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalParams, setModalParams] = useState<ShowModalParams>({
    title: '',
    message: '',
    type: 'info',
  });
  const onCloseCallback = useRef<(() => void) | undefined>(undefined);

  const showModal = useCallback(({ title, message, type = 'info', icon, onClose }: ShowModalParams) => {
    setModalParams({ title, message, type, icon });
    onCloseCallback.current = onClose;
    setModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    if (onCloseCallback.current) {
      onCloseCallback.current();
      onCloseCallback.current = undefined;
    }
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showModal({ title, message, type: 'success' });
  }, [showModal]);

  const showError = useCallback((title: string, message: string) => {
    showModal({ title, message, type: 'error' });
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string) => {
    showModal({ title, message, type: 'info' });
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string) => {
    showModal({ title, message, type: 'warning' });
  }, [showModal]);

  const ModalComponent: React.ReactNode = (
    <CustomModal
      visible={modalVisible}
      onClose={handleModalClose}
      title={modalParams.title}
      message={modalParams.message}
      type={modalParams.type}
      icon={modalParams.icon}
    />
  );

  return {
    ModalComponent,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

export default useModal;
