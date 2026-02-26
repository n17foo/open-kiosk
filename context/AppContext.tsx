import React, { createContext, useContext, useState, useMemo } from 'react';

type Mode = 'dinein' | 'takeaway';

type User = {
  id: string;
  name?: string;
  email?: string;
};

interface AppState {
  mode?: Mode;
  user?: User;
  language: string;
  kioskId?: string;
  setMode: (mode: Mode) => void;
  setUser: (user?: User) => void;
  setLanguage: (lang: string) => void;
  setKioskId: (id?: string) => void;
  clearSession: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>();
  const [user, setUser] = useState<User>();
  const [language, setLanguage] = useState<string>('en');
  const [kioskId, setKioskId] = useState<string | undefined>();

  const clearSession = () => {
    setMode(undefined);
    setUser(undefined);
  };

  const value = useMemo(
    () => ({
      mode,
      setMode,
      user,
      setUser,
      language,
      setLanguage,
      kioskId,
      setKioskId,
      clearSession,
    }),
    [mode, user, language, kioskId]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
