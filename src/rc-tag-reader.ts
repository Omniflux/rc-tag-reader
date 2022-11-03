import bleno from "@abandonware/bleno";

import { DeviceTimeService } from "./bluetooth/DTS/DeviceTimeService";
import { TagReaderService } from "./bluetooth/TRS/TagReaderService";

const NAME = "Tag Reader";

let data: Data = { temperature: 0, cooldownPeriod: 0 };

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
