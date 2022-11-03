import bleno from "@abandonware/bleno";
import { DefaultFSInventory, FastSwitchInventoryParams, R2KReader } from "node-r2k";
import { READER_ANTENNA } from "node-r2k/constant";
import { FastSwitchInventory } from "node-r2k/enums";

import { DeviceTimeService } from "./bluetooth/DTS/DeviceTimeService";
import { TagReaderService } from "./bluetooth/TRS/TagReaderService";

const NAME = "Tag Reader";
const READER_PORT = "/dev/rfid";
const ANTENNA_CONNECTED_MIN_RETURN_LOSS = 3;

const COOLDOWN_MIN_INTERVAL = 50;
const COOLDOWN_MAX_INTERVAL = 750;
const COOLDOWN_RECALCULATION_INTERVAL = 2000;

const delayms = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let data: Data = { temperature: 0, cooldownPeriod: COOLDOWN_MIN_INTERVAL };

async function readTags() {
  const r2k = new R2KReader({ path: READER_PORT, baudRate: 115200, stopBits: 1, dataBits: 8 });

  // Initialize antennas
  const antennaParams: FastSwitchInventoryParams = DefaultFSInventory;
  for (let i = 0; i < READER_ANTENNA.MAX; i++) {
    await r2k.set_work_antenna(i);
    // TODO Use r2k.get_frequency_reader() to get frequency to use for loss test
    const antennaLetter = String.fromCharCode(i);
    const loss = (await r2k.get_rf_port_return_loss(902)) || 0;
    if (loss >= ANTENNA_CONNECTED_MIN_RETURN_LOSS) {
      console.info("Found antenna ", antennaLetter);
      (<any>antennaParams)[antennaLetter] = i;
    }
    else
      (<any>antennaParams)[antennaLetter] = FastSwitchInventory.DISABLED;
  }

  // Automatically adjust cooldown period based on RFID reader temperature
  async function calculateCoolDownPeriod() {
    data.temperature = Math.floor(Math.random() * 99); //await r2k.temperature();
    const mult = (data.temperature - 40) / 2;
    data.cooldownPeriod = Math.max(Math.min(50 * (mult + 1), COOLDOWN_MAX_INTERVAL), COOLDOWN_MIN_INTERVAL);
    console.info(`Temperature: ${data.temperature}°C, cool down period: ${data.cooldownPeriod}ms`);
  }
  setInterval(calculateCoolDownPeriod, COOLDOWN_RECALCULATION_INTERVAL);

  // Process tag read
  r2k.on("tagFound", (tag, when) => {
    console.info(`[${when}]: `, tag.EPC);
  });

  // Scan for tags
  while (true) {
    try {
      await r2k.start_fast_switch_ant_inventory({
        ...antennaParams,
        Interval: 255,
      });
    } catch (err) {
      console.warn("Error reading from RFID reader: ", err);
    } finally {
      await delayms(data.cooldownPeriod);
    }
  }
}

// Start Tag Reader
readTags().catch((err) => console.warn("Error: ", err));

// Initialize Bluetooth
bleno.on("stateChange", function (state) {
  if (state === "poweredOn") {
    console.info("Starting advertising");
    bleno.startAdvertising(NAME, undefined, function (err) {
      if (err) console.error("Error starting advertising: ", err);
    });
  } else {
    console.info("Stopping advertising");
    bleno.stopAdvertising();
  }
});

// Provide Bluetooth services
bleno.on("advertisingStart", function (err) {
  if (!err) {
    bleno.setServices([new DeviceTimeService(), new TagReaderService(data)]);
  } else console.error("Error advertising: ", err);
});
