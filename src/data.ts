export interface Data {
  temperature: number;
  restInterval: number;
  ports: number;
  epcs: {
    [key: string]: TagData;
  };
}

export interface TagData {
  epc: Buffer;
  first: Date;
  last: Date;
}
