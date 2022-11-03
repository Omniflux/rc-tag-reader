import bleno from "@abandonware/bleno";
import { TagReaderCooldownCharacteristic } from "./TagReaderCooldownCharacteristic";
import { TagReaderTemperatureCharacteristic } from "./TagReaderTemperatureCharacteristic";
import { TagReaderUptimeCharacteristic } from "./TagReaderUptimeCharacteristic";

export class TagReaderService extends bleno.PrimaryService {
  constructor(data: Data) {
    super({
      uuid: "08871673-6d1e-4150-abc7-243f4bc20000",
      characteristics: [
        new TagReaderUptimeCharacteristic(),
        new TagReaderTemperatureCharacteristic(data),
        new TagReaderCooldownCharacteristic(data),
      ],
    });
  }
}
