import { AxiosRequestConfig } from 'axios';
import { mockAxiosInstance } from '~/bootstrap/api-mock';
import { apiFactory } from '~/lib/api';
import axios from 'axios';

const noOp = () => void 0;

const axiosConfig: AxiosRequestConfig = {

}

export const api = apiFactory({
  axiosInstance: process.env.NODE_ENV === 'development' ? mockAxiosInstance : axios.create(axiosConfig),
  onRequest: noOp,
  onRequestError: noOp,
  onResponse: noOp,
  onResponseError: noOp,
  onUpdate: noOp,
});
