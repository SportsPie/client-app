/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

export const useAppState = () => {
  return useContext(AppStateContext);
};

export function AppStateProvider({ children }) {
  const [loginNow, setLoginNow] = useState(false);

  return (
    <AppStateContext.Provider
      value={{
        loginNow,
        setLoginNow,
      }}>
      {children}
    </AppStateContext.Provider>
  );
}
