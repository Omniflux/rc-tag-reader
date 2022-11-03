import bleno from "@abandonware/bleno";
//import { CharacteristicAggregateFormatDescriptor, CharacteristicPresentationFormatDescriptor } from "../Descriptors";
//import { GATTFormatTypes } from "../enums";
import { DTFeaturesFlags } from "./enums";

// Bluetooth Service Specification - Device Time Service - 3.1
export class DeviceTimeFeatureCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: "2b8e",
      properties: ["read"],
//      descriptors: [
//        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_16_BIT_INTEGER),
//        CharacteristicAggregateFormatDescriptor([1, 1]),
//      ],
      value: (() => {
        // TODO: Require authorization DTFeaturesFlags.AUTHORIZATION_REQUIRED
        const data = Buffer.alloc(4);
        data.writeUint16LE(0xffff); // E2E_CRC not supported
        data.writeUint16LE(DTFeaturesFlags.EPOCH_YEAR_2000, 2);
        return data;
      })(),
    });
  }
}
