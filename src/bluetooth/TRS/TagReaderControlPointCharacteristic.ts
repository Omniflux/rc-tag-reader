import bleno from "@abandonware/bleno";
import { exec } from "child_process";
import type { Data } from "../../data.js";
import { DTCPResponseValue } from "../DTS/enums.js";
import { ErrorCodes } from "../enums.js";
import { getUUID } from "../utilities.js";
import { TRCPCharacteristic, TRCPRequestOpcode, TRCPResponseValue, TRCP_UUID } from "./constants.js";

export class TagReaderControlPointCharacteristic extends bleno.Characteristic {
  data: Data;

  constructor(data: Data) {
    super({
      uuid: getUUID(TRCP_UUID, TRCPCharacteristic.CONTROL_POINT),
      properties: ["write", "indicate"],
    });
    this.data = data;
  }

  override onWriteRequest(
    data: Buffer,
    offset: number,
    _withoutResponse: boolean,
    callback: (result: number) => void
  ) {
    let operationFailed = false;
    if (!this.updateValueCallback) callback(ErrorCodes.CCCD_IMPROPERLY_CONFIGURED);
    else if (offset) callback(this.RESULT_ATTR_NOT_LONG);
    else if (data.length === 0) callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    else {
      const requestOpcode = data.readUInt8(0);

      if (requestOpcode === TRCPRequestOpcode.REBOOT) {
        exec(`sudo reboot`, (error) => {
          if (error) operationFailed = true;
        });
        if (operationFailed) this.updateValueCallback(Buffer.from([requestOpcode, DTCPResponseValue.OPERATION_FAILED]));
        else this.updateValueCallback(Buffer.from([requestOpcode, TRCPResponseValue.SUCCESS]));
      } else if (requestOpcode === TRCPRequestOpcode.RESET_DATA) {
        this.data.epcs = {};
        this.updateValueCallback(Buffer.from([requestOpcode, TRCPResponseValue.SUCCESS]));
      } else this.updateValueCallback(Buffer.from([requestOpcode, TRCPResponseValue.OPCODE_NOT_SUPPORTED]));
    }
    callback(operationFailed ? this.RESULT_UNLIKELY_ERROR : this.RESULT_SUCCESS);
  }
}
