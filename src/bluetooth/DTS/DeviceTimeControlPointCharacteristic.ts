import bleno from "@abandonware/bleno";
import date from "date-and-time";
import { exec } from "child_process";
import { ErrorCodes } from "../enums.js";
import {
  DTCPRequestOpcode,
  DTCPResponseValue,
  DTCPTimeUpdateFlags,
  DTCPResponseRejectionFlags,
  DTCPResponseOpcode,
} from "./enums.js";

const MIN_ACCEPTABLE_DATE = new Date(Date.UTC(2022, 0, 1));

// Bluetooth Service Specification - Device Time Service - 3.7
export class DeviceTimeControlPointCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: "2b91",
      properties: ["write", "indicate"],
    });
  }

  override onWriteRequest(data: Buffer, offset: number, _withoutResponse: boolean, callback: (result: number) => void) {
    // Bluetooth Service Specification - Device Time Service - 3.7.1.1.1
    const EXPECTED_DATA_LENGTH = 11;

    if (!this.updateValueCallback) callback(ErrorCodes.CCCD_IMPROPERLY_CONFIGURED);
    else if (offset) callback(this.RESULT_ATTR_NOT_LONG);
    else if (data.length === 0) callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    else {
      const requestOpcode = data.readUInt8(0);

      if (requestOpcode !== DTCPRequestOpcode.PROPOSE_TIME_UPDATE)
        this.updateValueCallback(Buffer.from([requestOpcode, DTCPResponseValue.OPCODE_NOT_SUPPORTED]));
      else if (data.length !== EXPECTED_DATA_LENGTH)
        this.updateValueCallback(Buffer.from([requestOpcode, DTCPResponseValue.INVALID_OPERAND]));
      else {
        let baseTime: Date | undefined;
        let setTimeFailed = false;
        let rejectionFlags = 0;

        const timeUpdateFlags = data.readUInt16LE(1);
        const baseTimeUpdate = data.readUInt32LE(3);
        const timeZoneUpdate = data.readInt8(7);
        const dstOffsetUpdate = data.readUInt8(8);
        //let timeSourceUpdate = data.readUInt8(9);
        //let timeAccuracyUpdate = data.readUInt8(10);

        if (!(timeUpdateFlags && 1 << DTCPTimeUpdateFlags.UTC_ALIGNED))
          rejectionFlags |= 1 << DTCPResponseRejectionFlags.TIME_SOURCE_NOT_UTC_ALIGNED;

        if (!(timeUpdateFlags && 1 << DTCPTimeUpdateFlags.EPOCH_YEAR_2000))
          rejectionFlags |= 1 << DTCPResponseRejectionFlags.EPOCH_YEAR_FLAG_NOT_ALIGNED;

        if (!rejectionFlags) {
          baseTime = new Date(Date.UTC(2000, 0, 1) + new Date(baseTimeUpdate).getTime());

          if (baseTime < MIN_ACCEPTABLE_DATE) {
            baseTime = undefined;
            rejectionFlags |= 1 << DTCPResponseRejectionFlags.TIME_VALUE_UNREALISTIC;
            rejectionFlags |= 1 << DTCPResponseRejectionFlags.OPERAND_OUT_OF_RANGE;
          }
        }

        if (timeZoneUpdate || dstOffsetUpdate)
          rejectionFlags |= 1 << DTCPResponseRejectionFlags.ACCEPTED_BASE_TIME_ONLY;

        if (baseTime) {
          exec(`sudo timedatectl set-time '${date.format(baseTime, "YYYY-MM-DD HH:mm:ss", true)} UTC'`, (error) => {
            if (error) setTimeFailed = true;
          });
        }

        if (setTimeFailed) this.updateValueCallback(Buffer.from([requestOpcode, DTCPResponseValue.OPERATION_FAILED]));
        else if (rejectionFlags) {
          const response = Buffer.from([
            DTCPResponseOpcode.DTCP_RESPONSE,
            requestOpcode,
            DTCPResponseValue.PROCEDURE_REJECTED,
            0,
            0,
          ]);
          response.writeUInt16LE(rejectionFlags, 3);
          this.updateValueCallback(response);
        } else
          this.updateValueCallback(
            Buffer.from([DTCPResponseOpcode.DTCP_RESPONSE, requestOpcode, DTCPResponseValue.SUCCESS])
          );
      }
      callback(this.RESULT_SUCCESS);
    }
  }
}
