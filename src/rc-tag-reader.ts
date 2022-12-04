import bleno from "@abandonware/bleno";
import { AntennaID, FastSwitchAntenna, R2KReader } from "node-r2k";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { setTimeout as setTimeoutPromise } from "node:timers/promises";
import type { FrequencyTableIndex } from "node-r2k/dist/constants.js";

import { DeviceTimeService } from "./bluetooth/DTS/DeviceTimeService.js";
import { TagReaderService } from "./bluetooth/TRS/TagReaderService.js";
import type { Data, TagData } from "./data.js";

const NAME = "Tag Reader";
const READER_PORT = "/dev/rfid";
const DATA_FILE = "epcData.json";

const REST_MIN_INTERVAL = 1;
const REST_MAX_INTERVAL = 50;
const DEFAULT_ANTENNA_PORTS = 0x0f; // 4 antenna ports
const SAVE_INTERVAL = 5000;

let data: Data = {
  temperature: 0,
  restInterval: REST_MIN_INTERVAL,
  ports: DEFAULT_ANTENNA_PORTS,
  epcs: loadTagData(DATA_FILE),
};

// Load tag data
function loadTagData(dataFile: string) {
  try {
    return Object.fromEntries(
      JSON.parse(readFileSync(dataFile, "ascii")).map(([epc, start, last]: [string, number, number]) => [
        epc,
        { epc: Buffer.from(epc, "hex"), first: new Date(start), last: new Date(last) } as TagData,
      ])
    );
  } catch {
    return {};
  }
}

// Save tag data
function saveData(dataFile: string) {
  const tmpFile = dataFile + ".tmp";
  writeFileSync(
    tmpFile,
    JSON.stringify(Object.entries(data.epcs).map(([epc, val]) => [epc, val.first.getTime(), val.last.getTime()]))
  );
  renameSync(tmpFile, dataFile);
}

async function readTags() {
  const rdr = new R2KReader({ path: READER_PORT });
  let antennas: FastSwitchAntenna[] = [];
  let ports = 0;
  let unsavedData = false;

  // Process tag read
  rdr.on("tagFound", (tag, when) => {
    const epc = tag.epc.toString("hex");
    data.epcs[epc] ??= { epc: tag.epc, first: when, last: when };
    data.epcs[epc]!.last = when;
    unsavedData = true;
  });

  // Drop missing antenna
  rdr.on("antennaMissing", (antenna) => {
    data.ports &= ~(1 << (antenna + 1));
  });

  // Save data timer
  async function saveTimer() {
    if (unsavedData) saveData(DATA_FILE);
    setTimeout(saveTimer, SAVE_INTERVAL);
  }

  // Automatically adjust rest interval based on RFID reader temperature
  async function recalculateRestInterval() {
    data.temperature = (await rdr.getTemperature()) || data.temperature;
    const calculatedInterval = Math.round((data.temperature - 40) / 2);
    data.restInterval = Math.max(Math.min(calculatedInterval, REST_MAX_INTERVAL), REST_MIN_INTERVAL);
  }

  // Detect connected antennas
  async function detectAntennas() {
    let frequencyIdx = 7 as FrequencyTableIndex;
    const frequencyBand = await rdr.getFrequencyBand();
    if ("region" in frequencyBand) frequencyIdx = frequencyBand.startFreq;

    antennas = [];
    for (let i = 0; i < (data.ports > 0x0f ? 8 : 4); i++) {
      let enabled = data.ports & (1 << i);
      const port = Math.log2(enabled);
      if (enabled) {
        await rdr.setWorkingAntenna(port);
        const sensitivity = await rdr.getAntennaDetectorSensitivity();
        const returnloss = await rdr.getReturnLoss(frequencyIdx);
        if (returnloss < sensitivity) enabled = 0;
      }
      antennas.push(enabled ? [port, 1] : [AntennaID.DISABLED, 0]);
    }
    console.info(`Requested antenna ports: ${data.ports.toString(2).padStart(8, "0")}`);
    data.ports = ports = antennas.reduce((acc, v) => acc | (v[0] === 0xff ? 0 : v[0] + 1), 0);
    console.info(`Using antenna ports: ${data.ports.toString(2).padStart(8, "0")}`);
  }

  // Scan for tags
  saveTimer();
  while (true) {
    if (ports !== data.ports) detectAntennas();
    if (ports) {
      await recalculateRestInterval();

      if (antennas.length === 4)
        await rdr.startFastSwitchAntennaInventory(
          1,
          data.restInterval,
          antennas as [FastSwitchAntenna, FastSwitchAntenna, FastSwitchAntenna, FastSwitchAntenna]
        );
      if (antennas.length === 8)
        await rdr.startFastSwitchAntennaInventory(
          1,
          data.restInterval,
          antennas as [
            FastSwitchAntenna,
            FastSwitchAntenna,
            FastSwitchAntenna,
            FastSwitchAntenna,
            FastSwitchAntenna,
            FastSwitchAntenna,
            FastSwitchAntenna,
            FastSwitchAntenna
          ]
        );
    } else await setTimeoutPromise(1000);
  }
}

// Initialize Bluetooth
bleno.on("stateChange", (state) => {
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
bleno.on("advertisingStart", (err) => {
  if (!err) {
    bleno.setServices([new DeviceTimeService(), new TagReaderService(data)]);
  } else console.error("Error advertising: ", err);
});

readTags();
