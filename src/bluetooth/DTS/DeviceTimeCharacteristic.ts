import bleno from "@abandonware/bleno";
//import { CharacteristicAggregateFormatDescriptor, CharacteristicPresentationFormatDescriptor } from "../Descriptors";
//import { GATTFormatTypes } from "../enums";

// Bluetooth Service Specification - Device Time Service - 3.3
export class DeviceTimeCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: "2b90",
      properties: ["read", "indicate"],
      //      descriptors: [
      //        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_32_BIT_INTEGER, { units: GATTUnits.TIME_SECOND }),
      //        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.SIGNED_8_BIT_INTEGER),
      //        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_8_BIT_INTEGER),
      //        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_16_BIT_INTEGER),
      //        CharacteristicAggregateFormatDescriptor([1, 2, 3, 4]),
      // TODO ValidRangeUInt32Descriptor somehow?
      //      ],
    });
  }

  override onReadRequest(offset: number, callback: (result: number, data?: Buffer) => void) {
    if (offset) callback(this.RESULT_ATTR_NOT_LONG);
    else {
      // TODO: Handle time fault

      const data = Buffer.alloc(8);

      // seconds since January 1, 2000 00:00:00 UTC
      data.writeUInt32LE(Math.floor((Date.now() - Date.UTC(2000, 0, 1)) / 1000), 0);

      // Time Zone
      // 0x0 - UTC
      data.writeInt8(0x0, 4);

      // DST Offset
      // Standard Time
      data.writeUint8(0x0, 5);

      // DT_Status
      // 0x10 - Epoch Year 2000
      data.writeUint16LE(0x10, 6);

      callback(this.RESULT_SUCCESS, data);
    }
  }
}
