import bleno from "@abandonware/bleno";
import type { Data } from "../../data.js";
import { ErrorCodes, GATTFormatTypes, GATTUnits } from "../enums.js";
import { CharacteristicPresentationFormatDescriptor, CharacteristicUserDescriptionDescriptor } from "../Descriptors.js";
import { TRCPCharacteristic, TRCP_UUID } from "./constants.js";
import { getUUID } from "../utilities.js";

export class TagReaderGetRecordsCharacteristic extends bleno.Characteristic {
  data: Data;
  report = Buffer.from([]);
  sentBytes = 0;

  constructor(data: Data) {
    super({
      uuid: getUUID(TRCP_UUID, TRCPCharacteristic.RECORDS),
      properties: ["write", "indicate"],
      descriptors: [
        CharacteristicUserDescriptionDescriptor("Get records newer than timestamp"),
        CharacteristicPresentationFormatDescriptor(GATTFormatTypes.UNSIGNED_64_BIT_INTEGER, {
          units: GATTUnits.TIME_SECOND,
        }),
      ],
    });
    this.data = data;
  }

  override onWriteRequest(data: Buffer, offset: number, _withoutResponse: boolean, callback: (result: number) => void) {
    if (!this.updateValueCallback) callback(ErrorCodes.CCCD_IMPROPERLY_CONFIGURED);
    else if (offset) callback(this.RESULT_ATTR_NOT_LONG);
    else if (data.length !== 8) callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    else {
      const timestamp = new Date(Number(data.readBigInt64LE()));
      let records: number[] = [];
      Object.entries(this.data.epcs)
        .filter(([_, val]) => val.last >= timestamp)
        .forEach(([_, val]) => {
          let timestamps = Buffer.alloc(16);
          timestamps.writeBigUInt64LE(BigInt(val.first.getTime()));
          timestamps.writeBigUInt64LE(BigInt(val.last.getTime()), 8);
          records.push(val.epc.length, ...val.epc, ...timestamps);
        });
      callback(this.RESULT_SUCCESS);
      this.sentBytes = 0;
      this.report = Buffer.from([0, 0, 0, 0, ...records]);
      this.report.writeUInt32LE(this.report.length);
      // Data returned is number of bytes in dataset (32bits)
      // followed by an array of records
      //  epc length (8bits)
      //  epc (N bits)
      //  first seen time including milliseconds (64 bits)
      //  last seen time including milliseconds (64 bits)
      this.onIndicate();
    }
  }

  override onIndicate() {
    if (this.sentBytes < this.report.length) {
      const sending = this.report.subarray(this.sentBytes, this.sentBytes + this.maxValueSize);
      this.sentBytes += sending.length;
      setImmediate(() => this.updateValueCallback?.(sending)); // Needs to run at end of event loop, not here...
    }
  }
}
