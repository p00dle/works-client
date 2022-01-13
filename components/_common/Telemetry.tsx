import type { Telemetry as TelemetryType } from '~/lib/telemetry';

import * as React from 'react';
import { useState, useEffect } from 'react';

import { useRouter } from '~/bootstrap/router';
import { useUserData } from '~/queries/user';


export const Telemetry: React.FC<{telemetry: TelemetryType}> = function Telemetry({telemetry}) {
  const [username, setUsername] = useState<null | string>(null);
  const { route, routeParams } = useRouter();
  const userdata = useUserData();
  useEffect(() => {
    telemetry.updatePath();
  }, [route, routeParams]);
  useEffect(() => {
    if (username !== null) telemetry.setUsername(username);
  }, [username]);
  useEffect(() => {
    if (userdata.data) setUsername(userdata.data.username);
  }, [userdata.data])
  return null;
}