import { v7 } from "uuid";

export type Mapping = {
  name: string,
  mappings: {
    gamepad: number, keyboard: string,
  }[]
}

export type MappingListItem = {
  uuid: string,
  name: Mapping['name'],
};

export type MappingList = MappingListItem[];

export const mockMappings: Map<string, Mapping> = new Map([
  [v7(), {
    name: "Lain PSP game",
    mappings: [
      { gamepad: 0, keyboard: 'k' }
    ]
  }],
  [v7(), {
    name: "Some really really long name of the game",
    mappings: [
      { gamepad: 3, keyboard: 'h' }
    ]
  }]
]);

export const mockMappingsList: MappingList = [...mockMappings.entries().map(([uuid, { name }]) => ({
  uuid, name
}))];

