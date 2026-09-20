import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import AuthRequiredModal from '../components/common/AuthRequiredModal';
import { useAuth } from './AuthContext';
import { navigateToAuthFlow } from '../utils/authGuard';

export interface AuthModalConfig {
  title?: string;
  message?: string;
  headerTitle?: string;
  actionText?: string;
  icon?: React.ReactNode;
  onLogin?: () => void;
}

interface AuthModalContextType {
  showAuthModal: (config?: AuthModalConfig) => void;
  hideAuthModal: () => void;
  requireAuth: (config?: AuthModalConfig) => boolean;
}

const AuthModalContext = createContext<AuthModalContextType>({
  showAuthModal: () => {},
  hideAuthModal: () => {},
  requireAuth: () => false,
});

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AuthModalConfig>({});
  const [navTarget, setNavTarget] = useState<any>(null);

  const showAuthModal = useCallback((cfg?: AuthModalConfig) => {
    setConfig(cfg || {});
    setVisible(true);
  }, []);

  const hideAuthModal = useCallback(() => {
    setVisible(false);
  }, []);

  const requireAuth = useCallback(
    (cfg?: AuthModalConfig) => {
      if (Boolean(token && user)) {
        return true;
      }
      showAuthModal(cfg);
      return false;
    },
    [token, user, showAuthModal]
  );

  const handleLogin = useCallback(() => {
    setVisible(false);
    if (config.onLogin) {
      config.onLogin();
      return;
    }
    // Attempt navigation to login flow
    if (navTarget) {
      navigateToAuthFlow(navTarget);
    }
  }, [config, navTarget]);

  return (
    <AuthModalContext.Provider value={{ showAuthModal, hideAuthModal, requireAuth }}>
      {children}
      <AuthRequiredModal
        visible={visible}
        onClose={hideAuthModal}
        title={config.title || 'Login Required'}
        subtitle={config.message || 'Please sign in or register to continue.'}
        headerTitle={config.headerTitle || 'Login Required'}
        actionText={config.actionText || 'Log In / Register'}
        icon={config.icon}
        onLogin={handleLogin}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
