import bleno from "@abandonware/bleno";
import { DeviceTimeCharacteristic } from "./DeviceTimeCharacteristic.js";
import { DeviceTimeControlPointCharacteristic } from "./DeviceTimeControlPointCharacteristic.js";
import { DeviceTimeFeatureCharacteristic } from "./DeviceTimeFeatureCharacteristic.js";
import { DeviceTimeParametersCharacteristic } from "./DeviceTimeParametersCharacteristic.js";

// Bluetooth Service Specification - Device Time Service - 2,3
export class DeviceTimeService extends bleno.PrimaryService {
  constructor() {
    super({
      uuid: "1847",
      characteristics: [
        new DeviceTimeFeatureCharacteristic(),
        new DeviceTimeParametersCharacteristic(),
        new DeviceTimeCharacteristic(),
        new DeviceTimeControlPointCharacteristic(),
      ],
    });
  }
}
