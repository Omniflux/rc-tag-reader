// Bluetooth Service Specification - Device Time Service, Section 3.1.1.2
export enum DTFeaturesFlags {
  E2E_CRC = 0,
  TIME_CHANGE_LOGGING = 1 << 1,
  BASE_TIME_SECOND_FRACTIONS = 1 << 2,
  TIME_OR_DATE_DISPLAYED_TO_USER = 1 << 3,
  DISPLAYED_FORMATS = 1 << 4,
  DISPLAYED_FORMATS_CHANGEABLE = 1 << 5,
  SEPARATE_USER_TIMELINE = 1 << 6,
  AUTHORIZATION_REQUIRED = 1 << 7,
  RTC_DRIFT_TRACKING = 1 << 8,
  EPOCH_YEAR_1900 = 1 << 9,
  EPOCH_YEAR_2000 = 1 << 10,
  PROPOSE_NON_LOGGED_TIME_ADJUSTMENT_LIMIT = 1 << 11,
  RETRIEVE_ACTIVE_TIME_ADJUSTMENTS = 1 << 12,
}

// Bluetooth Service Specification - Device Time Service, Section 3.7.1
export enum DTCPRequestOpcode {
  // RESERVED = 0x00, 0x01
  PROPOSE_TIME_UPDATE = 0x02,
  FORCE_TIME_UPDATE = 0x03,
  PROPOSE_NON_LOGGED_TIME_ADJUSTMENT_LIMIT = 0x04,
  RETRIEVE_ACTIVE_TIME_ADJUSTMENTS = 0x05,
}

// Bluetooth Service Specification - Device Time Service, Section 3.7.1
export enum DTCPResponseOpcode {
  // RESERVED = 0x06
  REPORT_ACTIVE_TIME_ADJUSTMENTS = 0x07,
  // RESERVED = 0x08
  DTCP_RESPONSE = 0x09,
}

// Bluetooth Service Specification - Device Time Service, Section 3.7.1.1.1.1
export enum DTCPTimeUpdateFlags {
  UTC_ALIGNED = 0,
  QUALIFIED_LOCAL_TIME = 1 << 1,
  ADJUST_REASON_MANUAL = 1 << 2,
  ADJUST_REASON_EXTERNAL = 1 << 3,
  ADJUST_REASON_TIME_ZONE = 1 << 4,
  ADJUST_REASON_DST_OFFSET = 1 << 5,
  EPOCH_YEAR_2000 = 1 << 6,
  SECOND_FRACTIONS_NOT_VALID = 1 << 7,
}

// Bluetooth Service Specification - Device Time Service, Section 3.7.1.2.2.1
export enum DTCPResponseValue {
  // RESERVED = 0,
  SUCCESS = 1,
  OPCODE_NOT_SUPPORTED = 2,
  INVALID_OPERAND = 3,
  OPERATION_FAILED = 4,
  PROCEDURE_REJECTED = 5,
  // RESERVED = 6,
  DEVICE_BUSY = 7,
}

// Bluetooth Service Specification - Device Time Service, Section 3.7.1.2.2.2
export enum DTCPResponseRejectionFlags {
  TIME_VALUE_UNREALISTIC = 0,
  NOT_AUTHORIZED = 1 << 1,
  OPERAND_OUT_OF_RANGE = 1 << 2,
  TIME_SOURCE_NOT_UTC_ALIGNED = 1 << 3,
  TIME_ACCURACY_UPDATE_OUT_OF_RANGE = 1 << 4,
  TIME_SOURCE_QUALITY_TOO_LOW = 1 << 5,
  EPOCH_YEAR_FLAG_NOT_ALIGNED = 1 << 6,
  // RESERVED = 1<<7,
  LACK_OF_PRECISION = 1 << 8,
  ACCEPTED_BASE_TIME_ONLY = 1 << 9,
  ACCEPTED_TIME_ZONE_AND_DST_ONLY = 1 << 10,
}
