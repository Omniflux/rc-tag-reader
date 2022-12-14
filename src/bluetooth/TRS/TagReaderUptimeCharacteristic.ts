import bleno from "@abandonware/bleno";
import { GATTFormatTypes, GATTUnits } from "../enums.js";
import { CharacteristicPresentationFormatDescriptor, CharacteristicUserDescriptionDescriptor } from "../Descriptors.js";
import { getUUID } from "../utilities.js";
import { TRCPCharacteristic, TRCP_UUID } from "./constants.js";

export class TagReaderUptimeCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: getUUID(TRCP_UUID, TRCPCharacteristic.UPTIME),
      properties: ["read"],
      descriptors: [
        CharacteristicUserDescriptionDescriptor("Uptime"),
        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_32_BIT_INTEGER, {
          units: GATTUnits.TIME_SECOND,
        }),
      ],
    });
  }

  override onReadRequest(offset: number, callback: (result: number, data?: Buffer) => void) {
    if (offset) callback(this.RESULT_ATTR_NOT_LONG);
    else {
      const data = Buffer.alloc(4);
      data.writeUInt32LE(process.uptime());
      callback(this.RESULT_SUCCESS, data);
    }
  }
}
