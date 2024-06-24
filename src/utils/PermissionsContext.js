/* eslint-disable react/jsx-no-constructed-context-values */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  requestPermission,
  checkMultiplePermissions,
  requestMultiplePermissions,
} from './PermissionUtils';
import SPModal from '../components/SPModal';
import { TranslationContext } from './TranslationContext';
import { requestPostNotificationsPermission } from './FirebaseMessagingService';

const PermissionsContext = createContext();

export const usePermissions = () => {
  return useContext(PermissionsContext);
};

export function PermissionsProvider({ children }) {
  const { translation, setLanguage } = useContext(TranslationContext);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkMultiplePermissions()
      .then(response => {
        const allPermissionsGranted = Object.values(response).every(
          status => status === 'granted',
        );

        if (!allPermissionsGranted) {
          return requestMultiplePermissions();
        }
      })
      .then(() => {
        requestPostNotificationsPermission();
      });
  }, []);

  const requestPermissions = async cbPermission => {
    let isResults = false;
    if (cbPermission.permission === 'success') {
      return true;
    }
    await requestPermission(cbPermission.permission)
      .then(results => {
        setShowModal(!results);
        setErrorMsg(translation[cbPermission.errorMsg]);
        isResults = results;
      })
      .catch(() => {
        isResults = false;
      });
    return isResults;
  };

  return (
    <PermissionsContext.Provider value={requestPermissions}>
      {children}
      <SPModal
        visible={showModal}
        contents={errorMsg}
        onConfirm={() => {
          setShowModal(false);
          setErrorMsg('');
        }}
      />
    </PermissionsContext.Provider>
  );
}
