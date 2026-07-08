import { unraidQuery } from './unraidGraphql.js';

const UPS_DEVICES_QUERY = `
query UpsDevices {
  upsDevices {
    id
    name
    model
    status
    battery {
      chargeLevel
      estimatedRuntime
      health
    }
    power {
      inputVoltage
      outputVoltage
      loadPercentage
      nominalPower
      currentPower
    }
  }
}
`;

type GqlUpsPower = {
  inputVoltage: number;
  outputVoltage: number;
  loadPercentage: number;
  nominalPower: number | null;
  currentPower: number | null;
};

type GqlUpsDevice = {
  id: string;
  name: string;
  model: string;
  status: string;
  battery: {
    chargeLevel: number;
    estimatedRuntime: number;
    health: string;
  };
  power: GqlUpsPower;
};

export type AdminUpsDevice = {
  id: string;
  name: string;
  model: string;
  status: string;
  powerWatts: number | null;
  loadPercent: number;
  nominalPowerWatts: number | null;
  inputVoltage: number | null;
  outputVoltage: number | null;
  batteryPercent: number;
  batteryRuntimeSec: number;
  batteryHealth: string;
};

export type AdminPowerSummary = {
  available: boolean;
  totalWatts: number | null;
  devices: AdminUpsDevice[];
};

export function resolveUpsPowerWatts(power: GqlUpsPower): number | null {
  if (power.currentPower != null && Number.isFinite(power.currentPower)) {
    return Math.round(power.currentPower);
  }
  if (power.nominalPower != null && power.nominalPower > 0) {
    return Math.round((power.nominalPower * power.loadPercentage) / 100);
  }
  return null;
}

function mapUpsDevice(device: GqlUpsDevice): AdminUpsDevice {
  const powerWatts = resolveUpsPowerWatts(device.power);
  return {
    id: device.id,
    name: device.name,
    model: device.model,
    status: device.status,
    powerWatts,
    loadPercent: device.power.loadPercentage,
    nominalPowerWatts: device.power.nominalPower,
    inputVoltage: device.power.inputVoltage,
    outputVoltage: device.power.outputVoltage,
    batteryPercent: device.battery.chargeLevel,
    batteryRuntimeSec: device.battery.estimatedRuntime,
    batteryHealth: device.battery.health,
  };
}

/** Optional — requires Unraid UPS service and a USB/network UPS configured. */
export async function fetchPowerSummary(): Promise<{
  power: AdminPowerSummary;
  warnings: string[];
}> {
  try {
    const { data, warnings } = await unraidQuery<{ upsDevices: GqlUpsDevice[] }>(UPS_DEVICES_QUERY);
    const devices = (data.upsDevices ?? []).map(mapUpsDevice);
    const wattValues = devices.map((d) => d.powerWatts).filter((w): w is number => w != null);
    const totalWatts = wattValues.length > 0 ? wattValues.reduce((a, b) => a + b, 0) : null;

    return {
      power: {
        available: devices.length > 0,
        totalWatts,
        devices,
      },
      warnings,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      power: { available: false, totalWatts: null, devices: [] },
      warnings: [`UPS power unavailable: ${message}`],
    };
  }
}
