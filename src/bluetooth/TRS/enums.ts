export enum TRCPRequestOpcode {
  // RESERVED = 0
  REBOOT = 1,
}

export enum TRCPResponseValue {
  // RESERVED = 0,
  SUCCESS = 1,
  OPCODE_NOT_SUPPORTED = 2,
  INVALID_OPERAND = 3,
  OPERATION_FAILED = 4,
  PROCEDURE_REJECTED = 5,
}
