export const TRCP_UUID = "08871673-6d1e-4150-abc7-243f4bc20000";

export enum TRCPCharacteristic {
  CONTROL_POINT,
  UPTIME,
  TEMPERATURE,
  REST_INTERVAL,
  ANTENNAS,
  RECORDS,
}

export enum TRCPRequestOpcode {
  // RESERVED = 0
  REBOOT = 1,
  RESET_DATA,
}

export enum TRCPResponseValue {
  // RESERVED = 0,
  SUCCESS = 1,
  OPCODE_NOT_SUPPORTED,
  INVALID_OPERAND,
  OPERATION_FAILED,
  PROCEDURE_REJECTED,
}
