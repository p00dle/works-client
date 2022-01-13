import type { UserTelemetryLog } from '~/lib/telemetry';

import { ws } from '~/bootstrap/ws';
import { format } from '~/lib/format';
import { registerTelemetry } from '~/lib/telemetry';

// const SHOULD_LOG = true;
const SHOULD_LOG = false;

let lastTelemetryUuid: string;
function consoleConsumer(log: UserTelemetryLog) {
  if (SHOULD_LOG && log.uuid !== lastTelemetryUuid) {
    const detailsStr = log.details && Object.keys(log.details).length > 0 ? '\n' + JSON.stringify(log.details, null, 2) : ''
    console.debug(`TELEMETRY [${format.number.asDateTime(log.timestamp)}] [${log.type}] [${log.path}]${detailsStr}`)
  }
  lastTelemetryUuid = log.uuid;
}
function wsConsumer(log: UserTelemetryLog) {
  ws.send('user-telemetry', log);
}

const consumer = process.env.NODE_ENV === 'development' ? consoleConsumer : wsConsumer;

export const telemetry = registerTelemetry({
  consumer,
  useErrors: true,
  useNavigation: true,
  requireUsername: false,
  windowObj: window
});
