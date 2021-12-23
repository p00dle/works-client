import * as React from 'react';
import { useState, useReducer, useRef } from 'react';
import { api } from '~/bootstrap/api';
import { Button } from '~/components/_common/Button';

interface FileUploadProps {
  apiRoute: string;
  title: string;
  transformPayload?: (file: Buffer) => any;
  messages?: Record<FileUploadStatus, string>;
}

type FileUploadStatus =
  | 'idle'
  | 'loading'
  | 'parsing'
  | 'ready'
  | 'uploading'
  | 'done'
  | 'error'
;

const defaultMessages: Record<FileUploadStatus, string> = {
  'idle': 'Select file',
  'loading': 'Loading...',
  'parsing': 'Parsing...',
  'ready': 'Click submit to proceed',
  'uploading': 'Uploading...',
  'done': 'Upload complete',
  'error': 'Unknown error',
}


interface FileUploadState {
  status: FileUploadStatus;
  messages: Record<FileUploadStatus, string>;
  message: string;
  payload: any;
  filename: string;
}

const initialState: Omit<FileUploadState, 'messages'> = {
  status: 'idle',
  message: '',
  payload: null,
  filename: '',
}

type FileUploadAction = 
  | { type: 'update-status', payload: {status: FileUploadStatus, message?: string}}
  | { type: 'update-payload', payload: {payload: any}}
  | { type: 'update-filename', payload: {filename: string}}
;


function fileUploadReducer(state: FileUploadState, action: FileUploadAction): FileUploadState {
  switch(action.type) {
    case 'update-filename': return {...state, ...action.payload};
    case 'update-payload': return {...state, ...action.payload};
    case 'update-status': return {...state, status: action.payload.status, message: action.payload.message || state.messages[action.payload.status]}
    default: return state;
  }
}

export const FileUpload: React.FC<FileUploadProps> = function FileUpload({title, apiRoute, transformPayload, messages = defaultMessages}) {
  const [state, dispatch] = useReducer(fileUploadReducer, {...initialState, messages, message: messages.idle});
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const disableSubmit = !(state.status === 'ready' || state.status === 'done' || state.status === 'error');
  const updateFilename = (filename: string) => dispatch({type: 'update-filename', payload: {filename}});
  const updatePayload = (payload: any) => dispatch({type: 'update-payload', payload: {payload}});
  const updateStatus = (status: FileUploadStatus, message?: string) => dispatch({type: 'update-status', payload: {status, message}});

  function processFile(file: File) {
    updateFilename(file.name);
    const reader = new FileReader();
    reader.addEventListener('load', async event => {
      if (!event.target || !event.target.result || typeof event.target.result !== 'string') {
        updateStatus('error', 'Error reading file');
        return;
      }
      const fileBuffer = event.target.result as unknown as Buffer;
      if (transformPayload) {
        updateStatus('parsing');
        updatePayload(transformPayload(fileBuffer));
      } else {
        updatePayload({file: fileBuffer});
      }
      updateStatus('ready');
    });
    reader.readAsBinaryString(file);
    updateStatus('loading');    
  }

  function onFileDrop(event: React.DragEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.preventDefault();
    processFile(event.dataTransfer.files[0]);
  }

  function onOtherDrag(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  }

  async function onSubmit() {
    updateStatus('uploading');
    try {
      const response = await api.request('POST', apiRoute, undefined, state.payload);
      updateStatus('done', response);
    } catch (err) {
      updateStatus('error', String(err));
    }
  }

  function onBrowseClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function onFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    processFile((event.target.files || [])[0])

  }
  return (
    <div className="border-2 rounded-lg secondary">
      <div className="text-lg tertiary p-2 rounded-t-md border-b-2">{title}</div>
      <div className="flex flex-row space-y-2 py-2 items-center justify-evenly">
        <div className="w-24 h-24 border-dashed primary border-2 rounded-md flex items-center justify-center" onDrop={onFileDrop} onDrag={onOtherDrag} onDragEnter={onOtherDrag} onDragOver={onOtherDrag}>
          <div className="text-center w-16">DROP HERE</div>
        </div>
        <div className="text-xl">OR</div>
        <div className="">
          <Button className="btn-primary" onClick={onBrowseClick}>BROWSE</Button>
          <input type="file" className="hidden" onChange={onFileSelect} ref={fileInputRef} />
        </div>
      </div>
      <div className="flex justify-center items-center my-4">
        <Button className="btn-primary" onClick={onSubmit} disabled={disableSubmit}>SUBMIT</Button>
      </div>
      <div className="secondary border-t-2 px-4 py-2 h-10">
        <div>{state.filename}</div>
      </div>      
      <div className="primary border-t-2 rounded-b-md px-4 py-2 h-10">
        <div>{state.message}</div>
      </div>      
    </div>
  );
};
