import bleno from "@abandonware/bleno";
import { GATTFormatTypes, GATTUnits } from "../enums";
import { CharacteristicPresentationFormatDescriptor, CharacteristicUserDescriptionDescriptor } from "../Descriptors";

export class TagReaderUptimeCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: "08871673-6d1e-4150-abc7-243f4bc20001",
      properties: ["read"],
      descriptors: [
        CharacteristicUserDescriptionDescriptor("Tag Reader Uptime"),
        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_32_BIT_INTEGER, {
          units: GATTUnits.TIME_SECOND,
        }),
      ],
    });
  }

  override onReadRequest(_offset: number, callback: (result: number, data?: Buffer) => void) {
    const data = Buffer.alloc(4);
    data.writeUInt32LE(process.uptime());
    callback(this.RESULT_SUCCESS, data);
  }
}
