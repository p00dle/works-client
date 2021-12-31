import * as React from 'react';
import { ModalProps, useModal } from '~/components/layout/Modal'
import { Button } from '~/components/_common/Button';


const ErrorModal: React.FC<ModalProps<{text: string}>> = function ErrorModal({hideModal, props}) {
  return (
    <div className="space-y-8">
      <div>{props.text}</div>
      <div className="">
        <Button className="btn-primary" onClick={hideModal}>DISMISS</Button>
      </div>
    </div>
  );
}

export function useErrorModal(text: string) {
  return useModal('ERROR', ErrorModal, {text});
}