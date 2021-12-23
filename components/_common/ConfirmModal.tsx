import * as React from 'react';
import { ModalProps, useModal } from '~/components/layout/Modal'
import { Button } from '~/components/_common/Button';


const ConfirmModal: React.FC<ModalProps<{text: string, onConfirm: () => void}>> = function ConfirmModal({hideModal, props}) {
  function confirm() {
    hideModal();
    props.onConfirm();
  }
  return (
    <div className="space-y-8">
      <div>{props.text}</div>
      <div className="flex justify-between">
        <Button className="btn-primary" onClick={confirm}>CONFIRM</Button>
        <Button className="btn-secondary" onClick={hideModal}>CANCEL</Button>
      </div>
    </div>
  );
}

export function useConfirmModal(text: string, onConfirm: () => void) {
  return useModal('CONFIRM', ConfirmModal, {text, onConfirm});
}