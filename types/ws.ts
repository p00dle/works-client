import { QueryParams, QueryType } from './_common';

interface WsChannel<T, Q extends QueryParams = any> {
  query?: Q;
  select?: (query: QueryType<Q>, payload: T) => boolean | Promise<boolean>;
}

export type WsChannels = {
  [Route: string]: WsChannel<any, any>;
}

export type WsChannelPayload<C extends WsChannel<any>> = C extends WsChannel<infer T> ? T : never;

export interface WsClientMessage<T extends WsChannels, C extends keyof T = keyof T> {
  channel: C;
  subscribe: boolean;
  query: QueryType<T[C]['query']>;
}

export type WsApiParser<T extends WsChannels> = {
  [C in keyof T]: {
    query: QueryType<T[C]['query']>;
    payload: WsChannelPayload<T[C]>;
  }
}