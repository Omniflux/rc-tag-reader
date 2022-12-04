import bleno from "@abandonware/bleno";
import type { Data } from "../../data.js";
import { GATTFormatTypes, GATTUnits } from "../enums.js";
import { CharacteristicPresentationFormatDescriptor, CharacteristicUserDescriptionDescriptor } from "../Descriptors.js";
import { TRCPCharacteristic, TRCP_UUID } from "./constants.js";
import { getUUID } from "../utilities.js";

export class TagReaderAntennasCharacteristic extends bleno.Characteristic {
  data: Data;

  constructor(data: Data) {
    super({
      uuid: getUUID(TRCP_UUID, TRCPCharacteristic.ANTENNAS),
      properties: ["read", "write"],
      descriptors: [
        CharacteristicUserDescriptionDescriptor("Antennas bitfield"),
        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_8_BIT_INTEGER, {
          units: GATTUnits.UNITLESS,
        }),
      ],
    });
    this.data = data;
  }

  override onReadRequest(offset: number, callback: (result: number, data?: Buffer) => void) {
    if (offset) callback(this.RESULT_ATTR_NOT_LONG);
    callback(this.RESULT_SUCCESS, Buffer.from([this.data.ports]));
  }

  override onWriteRequest(data: Buffer, offset: number, _withoutResponse: boolean, callback: (result: number) => void) {
    if (offset) callback(this.RESULT_ATTR_NOT_LONG);
    else if (data.length !== 1) callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    else {
      this.data.ports = data.readUInt8();
      callback(this.RESULT_SUCCESS);
    }
  }
}
