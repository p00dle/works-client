import * as React from 'react';
import { ModalProps } from '~/components/layout/Modal'
import { Button } from '~/components/_common/Button';

export const InfoModal: React.FC<ModalProps<{text: string}>> = function InfoModal({hideModal, props}) {
  return (
    <div className="space-y-8">
      <div>{props.text}</div>
      <div className="">
        <Button className="btn-primary" onClick={hideModal}>DISMISS</Button>
      </div>
    </div>
  );
}
