import bleno from "@abandonware/bleno";
import { ErrorCodes } from "../enums";
import { TRCPRequestOpcode, TRCPResponseValue } from "./enums";

export class TagReaderControlPointCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: "08871673-6d1e-4150-abc7-243f4bc20010",
      properties: ["write", "indicate"],
    });
  }

  override onWriteRequest(
    data: Buffer,
    _offset: number,
    _withoutResponse: boolean,
    callback: (result: number) => void
  ) {
    if (!this.updateValueCallback)
      callback(ErrorCodes.CCCD_IMPROPERLY_CONFIGURED);
    else if (data.length == 0)
      callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    else {
      const requestOpcode = data.readUInt8(0);
      if (requestOpcode == TRCPRequestOpcode.REBOOT) {
        // TODO placeholder. we don't really want a reboot option...
        this.updateValueCallback(Buffer.from([requestOpcode, TRCPResponseValue.SUCCESS]));
      }
      else
        this.updateValueCallback(Buffer.from([requestOpcode, TRCPResponseValue.OPCODE_NOT_SUPPORTED]));
    }
    callback(this.RESULT_SUCCESS);
  }
}
