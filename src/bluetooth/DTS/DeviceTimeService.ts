import bleno from "@abandonware/bleno";
import { DeviceTimeCharacteristic } from "./DeviceTimeCharacteristic";
import { DeviceTimeControlPointCharacteristic } from "./DeviceTimeControlPointCharacteristic";
import { DeviceTimeFeatureCharacteristic } from "./DeviceTimeFeatureCharacteristic";
import { DeviceTimeParametersCharacteristic } from "./DeviceTimeParametersCharacteristic";

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
