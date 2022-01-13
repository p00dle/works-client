import { v4 as uuid } from '@lukeed/uuid/secure';
import { areDictonariesEqual } from '~/lib/utils';

export interface UserTelemetryLog {
  uuid: string;
  type: string;
  username: string | null;
  path: string | null;
  timestamp: number;
  interval: number | null;
  details: any | null;
}

interface WindowLike {
  location: {
    pathname: string;
    search: string;
  }
}

interface TelemetryParams {
  consumer: (log: UserTelemetryLog) => any;
  useNavigation?: boolean;
  useErrors?: boolean;
  requireUsername?: boolean;
  navigationHeartbeatMs?: number;
  windowObj?: WindowLike;
}

export interface Telemetry {
  setUsername: (newUsername: string) => void;
  updatePath: () => void;
  log: (type: string, details: any) => void

}

export function registerTelemetry({consumer, useNavigation = true, useErrors = true, requireUsername = true, navigationHeartbeatMs = 2000, windowObj = window}: TelemetryParams): Telemetry {
  let isInitiated = !requireUsername;
  let username = '';
  let path: string | null = null;
  let query: Record<string, string> = {}
  let messageQueue: UserTelemetryLog[] = [];
  let currentNavigationUuid = uuid();
  let lastNavigation = Date.now();
  let navigationTimeoutHandle: NodeJS.Timeout | null = null;
  
  function logFullMessage(message: UserTelemetryLog) {
    if (isInitiated) {
      consumer(message);
    } else {
      messageQueue.push(message);
    }
  }
  function log(type: string, details: any) {
    logFullMessage({
      type, details, username, path, interval: 0,
      uuid: uuid(),
      timestamp: Date.now()
    });
  }
  function setUsername(newUsername: string) {
    username = newUsername;
    isInitiated = true;
    messageQueue.forEach(msg => {
      msg.username = username;
    })
  }
  function logNavigation(now: number) {
    logFullMessage({
      uuid: currentNavigationUuid, path, username,
      type: 'navigation',
      timestamp: lastNavigation,
      interval: Math.round((now - lastNavigation) / 1000),
      details: query
    })
  }  
  function parseQuery(query: string): Record<string, string> {
    const output: Record<string, string> = {};
    if (typeof query === 'string' && query.length > 0) {
      query.split(/[\?\&]/).filter(str => /=/.test(str)).forEach(str => {
        const [prop, value] = str.split('=');
        output[prop] = value;
      });
    }
    return output;
  }  
  function updatePath() {
    const newPath = windowObj.location.pathname;
    const newQuery = parseQuery(windowObj.location.search);
    if (useNavigation) {
      if (navigationTimeoutHandle) clearTimeout(navigationTimeoutHandle);
      const now = Date.now();
      if (path) logNavigation(now);
      // console.log({path, newPath, query, newQuery});
      // console.log('path !== newPath', path !== newPath);
      // console.log('areDictonariesEqual(query, newQuery)', areDictonariesEqual(query, newQuery));
      if (path && (path !== newPath || !areDictonariesEqual(query, newQuery))) {
        lastNavigation = now;
        currentNavigationUuid = uuid();
        path = newPath;
        query = newQuery;
        logNavigation(now);
      } else {
        path = newPath;
        query = newQuery;
      }
      navigationTimeoutHandle = setTimeout(() => updatePath(), navigationHeartbeatMs);
    } else {
      path = newPath;
      query = newQuery;
    } 
  }  
  updatePath();
  
  if (useErrors) {
    window.onerror = (event, source, line, column, error) => {
      const isError = error instanceof Error;
      const message = isError ? error.message : typeof event === 'string' ? event.replace(/^Error: /, '') : 'Unknown Error';
      const stack = isError ? error.stack : ''
      log('error', { message, source, line, column, stack});
    }
  }
  return {
    setUsername,
    log,
    updatePath,
  }
}
