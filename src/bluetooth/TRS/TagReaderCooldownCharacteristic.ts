import bleno from "@abandonware/bleno";
import { GATTFormatTypes, GATTUnits } from "../enums";
import { CharacteristicPresentationFormatDescriptor, CharacteristicUserDescriptionDescriptor } from "../Descriptors";

export class TagReaderCooldownCharacteristic extends bleno.Characteristic {
  data: Data;
  constructor(data: Data) {
    super({
      uuid: "08871673-6d1e-4150-abc7-243f4bc20003",
      properties: ["read"],
      descriptors: [
        CharacteristicUserDescriptionDescriptor("Tag Reader Cooldown"),
        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_8_BIT_INTEGER, {
          units: GATTUnits.TIME_SECOND,
          exponent: -3,
        }),
      ],
    });
    this.data = data;
  }

  override onReadRequest(_offset: number, callback: (result: number, data?: Buffer) => void) {
    callback(this.RESULT_SUCCESS, Buffer.from([this.data.cooldownPeriod]));
  }
}
