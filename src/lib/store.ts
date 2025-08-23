import { v7 } from "uuid";

export function isValidUrlPattern(url: string): { err: string } | { ok: true } {
  try {
    new URLPattern(url);
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return { err: err.message }
    }
    return { err: 'Pattern is invalid' };
  }
}

export type Mapping = {
  name: string,
  url: string,
  enabled: boolean,
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
    url: "https://blah.com",
    enabled: true,
    mappings: [
      { gamepad: 0, keyboard: 'k' }
    ]
  }],
  [v7(), {
    name: "Some really really long name of the game",
    url: "https://blah.com/*",
    enabled: false,
    mappings: [
      { gamepad: 3, keyboard: 'h' }
    ]
  }]
]);

export const mockMappingsList: MappingList = [...mockMappings.entries().map(([uuid, { name }]) => ({
  uuid, name
}))];

