import bleno from "@abandonware/bleno";
import type { Data } from "../../data.js";
import { TRCP_UUID } from "./constants.js";
import { TagReaderAntennasCharacteristic } from "./TagReaderAntennasCharacteristic.js";
import { TagReaderGetRecordsCharacteristic } from "./TagReaderGetRecords.js";
import { TagReaderRestIntervalCharacteristic } from "./TagReaderRestIntervalCharacteristic.js";
import { TagReaderTemperatureCharacteristic } from "./TagReaderTemperatureCharacteristic.js";
import { TagReaderUptimeCharacteristic } from "./TagReaderUptimeCharacteristic.js";

export class TagReaderService extends bleno.PrimaryService {
  constructor(data: Data) {
    super({
      uuid: TRCP_UUID,
      characteristics: [
        new TagReaderUptimeCharacteristic(),
        new TagReaderTemperatureCharacteristic(data),
        new TagReaderRestIntervalCharacteristic(data),
        new TagReaderAntennasCharacteristic(data),
        new TagReaderGetRecordsCharacteristic(data),
      ],
    });
  }
}
