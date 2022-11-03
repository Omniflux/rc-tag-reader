import bleno from "@abandonware/bleno";
import { GATTFormatTypes, GATTUnits } from "../enums";
import { CharacteristicPresentationFormatDescriptor, CharacteristicUserDescriptionDescriptor } from "../Descriptors";

export class TagReaderTemperatureCharacteristic extends bleno.Characteristic {
  data: Data;
  constructor(data: Data) {
    super({
      uuid: "08871673-6d1e-4150-abc7-243f4bc20002",
      properties: ["read"],
      descriptors: [
        CharacteristicUserDescriptionDescriptor("Tag Reader Temperature"),
        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_8_BIT_INTEGER, {
          units: GATTUnits.CELSIUS_TEMPERATURE_DEGREE_CELSIUS,
        }),
      ],
    });
    this.data = data;
  }

  override onReadRequest(_offset: number, callback: (result: number, data?: Buffer) => void) {
    callback(this.RESULT_SUCCESS, Buffer.from([this.data.temperature]));
  }
}
