import bleno from "@abandonware/bleno";
import { GATTFormatTypes, GATTUnits } from "./enums.js";

// Bluetooth Core Specification 5.3 [Vol 3] Part G, Section 3.3.3.2
export function CharacteristicUserDescriptionDescriptor(description: string) {
  return new bleno.Descriptor({
    uuid: "2901",
    value: Buffer.from(description),
  });
}

// Bluetooth Core Specification 5.3 [Vol 3] Part G, Section 3.3.3.5
export function CharacteristicPresentationFormatDescriptor(
  type: GATTFormatTypes,
  {
    exponent = 1,
    units = GATTUnits.UNITLESS,
    namespace = 1,
    description = 0,
  }: { type?: GATTFormatTypes; exponent?: number; units?: GATTUnits; namespace?: number; description?: number } = {}
) {
  let data = Buffer.from([type, exponent, 0, 0, namespace, 0, 0]);
  data.writeUInt16LE(units, 2);
  data.writeUInt16LE(description, 5);

  return new bleno.Descriptor({
    uuid: "2904",
    value: data,
  });
}

/*
// Bluetooth Core Specification 5.3 [Vol 3] Part G, Section 3.3.3.6
// NOTE: Not sure how to do this with bleno - attribute handle not available?
export function CharacteristicAggregateFormatDescriptor(handles: number[]) {
  let data = Buffer.alloc(1 + handles.length * 2);
  data.writeUint8(handles.length);
  for (let i = 0; i < handles.length; i++) data.writeUInt16LE(handles[i], 1 + i * 2);

  return new Descriptor({
    uuid: "2905",
    value: data,
  });
}
*/

// Bluetooth Core Specification 5.3 [Vol 3] Part G, Section 3.3.3.2
// TODO Is there a way to write this once for 8,16,32,64,...?
export function ValidRangeUInt32Descriptor(lower: number, upper: number) {
  let data = Buffer.alloc(8);
  data.writeUInt32LE(lower);
  data.writeUInt32LE(upper, 4);
  return new bleno.Descriptor({
    uuid: "2906",
    value: data,
  });
}
