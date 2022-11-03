import bleno from "@abandonware/bleno";
import { GATTFormatTypes } from "../enums";
import { CharacteristicPresentationFormatDescriptor } from "../Descriptors";

// Bluetooth Service Specification - Device Time Service - 3.2
export class DeviceTimeParametersCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: "2b8f",
      properties: ["read"],
      descriptors: [CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_16_BIT_INTEGER)],
      value: Buffer.from([0x00, 0x00]), // RTC Resolution unknown,
    });
  }
}
