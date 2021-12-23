import { AxiosRequestConfig } from 'axios';
import { apiMock } from '~/bootstrap/api-mock';
import { apiFactory } from '~/lib/api';

const noOp = () => void 0;

const axiosConfig: AxiosRequestConfig = {

}



export const api = process.env.NODE_ENV === 'development' 
  ? apiMock
  : apiFactory({
  axiosConfig,
  onRequest: noOp,
  onRequestError: noOp,
  onResponse: noOp,
  onResponseError: noOp,
  onUpdate: noOp,
});
