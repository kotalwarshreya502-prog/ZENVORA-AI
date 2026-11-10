import React, { createContext, useContext, useState } from 'react';
import { BRAND } from '../utils/constants';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [theme] = useState('light');
  const [appState] = useState({
    phase: 1,
    phaseName: 'Foundation Setup',
    brand: BRAND,
  });

  return (
    <AppContext.Provider value={{ appState, theme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;

