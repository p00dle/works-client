import React, { useReducer, useEffect, createContext, useContext, useRef } from 'react';
import { Icon } from '~/components/_common/Icon';


type ModalComponent<T = any> = React.FC<T & {updateResult?: (result: any) => void, hide?: () => any}>

export type ModalProps<T> = {
  props: T;
  hideModal: () => void;
}

interface ModalContextState {
  title: string | null;
  component: ModalComponent | null;
  shouldShow: boolean
  modalProps: any;
  modalClassName: string;
  showModal: <T>(title: string | null, component: ModalComponent<ModalProps<T>>, props?: T, modalClassName?: string) => void;
  hideModal: () => void;
}

type ModalReducerAction = 
  | { type: 'show-modal', payload: {component: ModalComponent, title: string | null, modalProps?: any, modalClassName: string} }
  | { type: 'hide-modal' }
  | { type: 'update-result', payload: {modalResult: any}}
  | { type: 'update-functions', payload: {
      showModal: (title: string, component: ModalComponent, props: any, modalClassName: string) => void;
      hideModal: () => void;
    }}
;

function modalReducer(state: ModalContextState, action: ModalReducerAction ): ModalContextState {
  switch (action.type) {
    case 'show-modal': {
      return { ...state, ...action.payload, shouldShow: true };
    }
    case 'hide-modal': {
      return { ...state, shouldShow: false }
    }
    case 'update-functions': {
      // @ts-ignore //TODO: fix typings; don't care about this at this point
      return {...state, ...action.payload};
    }
    case 'update-result': {
      return {...state, ...action.payload, shouldShow: false};
    }
    default: {
      return state;
    }
  }
}

const initialModalContextState: ModalContextState = {
  title: null,
  component: null,
  modalProps: null,
  modalClassName: '',
  shouldShow: false,
  showModal: () => void 0,
  hideModal: () => void 0,
}

export const ModalContext = createContext<ModalContextState>(initialModalContextState);

export function useModal<T>(title: string | null, component: ModalComponent<ModalProps<T>>, props?: T, modalClassName: string = '') {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  const { showModal } = context;
  return (updatedProps?: T) => {
    const isEvent = updatedProps && '_reactName' in updatedProps && 'target' in updatedProps;
    const modalProps = isEvent
      ? props
      : updatedProps && props 
        ? {...props, ...updatedProps} 
        : updatedProps 
          ? updatedProps 
          : props;
    showModal(title, component, modalProps, modalClassName);
  }
}




export const ModalProvider: React.FC = function ModalProvider({children}) {
  const [state, dispatch] = useReducer(modalReducer, initialModalContextState);
  useEffect(() => {
    function showModal(title: string | null, component: ModalComponent, modalProps?: any, modalClassName = '' ) {
      dispatch({type: 'show-modal', payload: {title, component, modalProps, modalClassName}});
    }
    function hideModal() {
      dispatch({type: 'hide-modal'})
    }
    dispatch({type: 'update-functions', payload: { showModal, hideModal }});
  }, []);
  return (
    <ModalContext.Provider value={state}>
      {children}
    </ModalContext.Provider>
  );
}

export const Modal: React.FC = function Modal() {
  const { component: Component, shouldShow, modalProps, hideModal, title, modalClassName } = useContext(ModalContext);
  return (
    <React.Fragment>
      <dialog className={"absolute h-screen opacity-30 dark:opacity-50 bg-black w-screen top-0 left-0 z-30 " + (shouldShow ? "block": "hidden") } onClick={hideModal} />
      <dialog className={"z-40 absolute top-[20vh] mx-auto left-0 right-0 rounded-lg p-0 border-2 primary border-inherit " + (modalClassName || "") + (shouldShow ? " block": " hidden")} >
        {title 
          ? <title className="tertiary text-lg p-4 rounded-t-sm flex">
            <span className="grow" >{title}</span>
            <div className="text-2xl cursor-pointer" onClick={hideModal}>
              <Icon icon="window-close" />
            </div>
          </title>
          : null
        }
        <div className={"rounded-b-lg " + (title ? "" : "rounded-t-lg")}>
          {Component !== null ? <Component props={modalProps} hideModal={hideModal}  /> : null}
        </div>
      </dialog>
    </React.Fragment>
  )
}