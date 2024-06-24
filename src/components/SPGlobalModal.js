import React from 'react';
import { useSelector } from 'react-redux';
import SPModal from './SPModal';
import Utils from '../utils/Utils';

export default function SPGlobalModal() {
  const modalState = useSelector(state => state.modal);

  // title 있는 경우 :: 상단에 close 박스
  // title 이 없는 경우 :: 하단에 버튼
  // 버튼 종류 : noBorderButton, twoButton, oneButtonoseEvent);

  return (
    <SPModal
      title={modalState.modalTitle}
      contents={modalState.modalBody}
      visible={modalState.isOpen}
      {...(modalState.confirmEvent
        ? { onConfirm: Utils.confirmModal }
        : { onConfirm: Utils.closeModal })}
      {...(modalState.cancelEvent
        ? { onCancel: Utils.cancelModal, twoButton: true }
        : null)}
      onClose={Utils.closeModal}
    />
  );
}
