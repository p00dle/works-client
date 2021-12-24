import * as React from 'react';
import { ModalProps, useModal } from '~/components/layout/Modal'
import { Button } from '~/components/_common/Button';

type InfoModalType = 
  | 'default'
  | 'error'
  | 'success'
;

interface InfoModalProps {
  text: string;
  type: InfoModalType;
}


const classesByType: Record<InfoModalType, string> = {
  'default': '',
  'error': 'error-message',
  'success': 'success-message'
}


export const InfoModal: React.FC<ModalProps<InfoModalProps>> = function InfoModal({hideModal, props}) {
  return (
    <div className="space-y-8 p-4">
      <div className={classesByType[props.type]}>{props.text}</div>
      <div className="">
        <Button className="btn-primary" onClick={hideModal}>DISMISS</Button>
      </div>
    </div>
  );
}

export function useInfoModal(text: string = '', type: InfoModalType = 'default') {
  return useModal(null, InfoModal, {text, type});
}