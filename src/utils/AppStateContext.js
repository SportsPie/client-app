/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

export const useAppState = () => {
  return useContext(AppStateContext);
};

const initApplyData = {
  eventIdx: null,
  targetIdx: null,
  participationName: null,
  participationBirth: null,
  participationGender: null,
  address: null,
  addressDetail: null,
  postCode: null,
  guardianName: null,
  guardianContact: null,
  guardianRelationship: null,
  phoneNumber: null,
  acdmyName: null,
  awards: null,
  preferredPlay: null,
  refundBank: null,
  refundAccount: null,
  refundName: null,
  depositName: null,
  height: null,
  weight: null,
  shoeSize: null,
  backNo: null,
  mainFoot: null,
  firstWish: null,
  secondWish: null,
  thirdWish: null,
  careerList: null,
  profilePath: null,
  profileName: null,
};

export function AppStateProvider({ children }) {
  const [loginNow, setLoginNow] = useState(false);
  const [applyData, setApplyData] = useState(
    JSON.parse(JSON.stringify(initApplyData)),
  );

  const resetApplyData = () => {
    setApplyData(JSON.parse(JSON.stringify(initApplyData)));
  };

  return (
    <AppStateContext.Provider
      value={{
        loginNow,
        setLoginNow,
        applyData,
        setApplyData,
        resetApplyData,
      }}>
      {children}
    </AppStateContext.Provider>
  );
}
