import bleno from "@abandonware/bleno";
import type { Data } from "../../data.js";
import { GATTFormatTypes, GATTUnits } from "../enums.js";
import { CharacteristicPresentationFormatDescriptor, CharacteristicUserDescriptionDescriptor } from "../Descriptors.js";
import { TRCPCharacteristic, TRCP_UUID } from "./constants.js";
import { getUUID } from "../utilities.js";

export class TagReaderRestIntervalCharacteristic extends bleno.Characteristic {
  data: Data;

  constructor(data: Data) {
    super({
      uuid: getUUID(TRCP_UUID, TRCPCharacteristic.REST_INTERVAL),
      properties: ["read"],
      descriptors: [
        CharacteristicUserDescriptionDescriptor("Rest interval"),
        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_8_BIT_INTEGER, {
          units: GATTUnits.TIME_SECOND,
        }),
      ],
    });
    this.data = data;
  }

  override onReadRequest(offset: number, callback: (result: number, data?: Buffer) => void) {
    if (offset) callback(this.RESULT_ATTR_NOT_LONG);
    callback(this.RESULT_SUCCESS, Buffer.from([this.data.restInterval]));
  }
}
