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
    gamepad: ExtendedButton, keyboard: string,
  }[]
}

export type MappingListItem = {
  uuid: string,
  name: Mapping['name'],
};

export type MappingList = MappingListItem[];



// The "standard" mapping for buttons from the gamepad api standard
// ref: https://w3c.github.io/gamepad/#remapping
export enum StandardButton {
  RightClusterBottomButton = 0,
  RightClusterRightButton,
  RightClusterLeftButton,
  RightClusterTopButton,
  TopLeftButton,
  TopRightButton,
  BottomLeftButton,
  BottomRightButton,
  CenterClusterLeftButton,
  CenterClusterRightButton,
  LeftStickButton,
  RightStickButton,
  LeftClusterTopButton,
  LeftClusterBottomButton,
  LeftClusterLeftButton,
  LeftClusterRightButton,
  CenterButton,
}

export enum ExtendedButton {
  // standard button indexes
  RightClusterBottomButton = 0,
  RightClusterRightButton,
  RightClusterLeftButton,
  RightClusterTopButton,
  TopLeftButton,
  TopRightButton,
  BottomLeftButton,
  BottomRightButton,
  CenterClusterLeftButton,
  CenterClusterRightButton,
  LeftStickButton,
  RightStickButton,
  LeftClusterTopButton,
  LeftClusterBottomButton,
  LeftClusterLeftButton,
  LeftClusterRightButton,
  CenterButton,

  // extended to treat joysticks as buttons
  LeftStickBottomDirection,
  LeftStickRightDirection,
  LeftStickLeftDirection,
  LeftStickTopDirection,
  RightStickBottomDirection,
  RightStickRightDirection,
  RightStickLeftDirection,
  RightStickTopDirection,

  // extended to treat triggers as buttons
  TriggerLeft,
  TriggerRight,
}

// The "standard" mapping for buttons from the gamepad api standard
// ref: https://w3c.github.io/gamepad/#remapping
export enum StandardAxesMapping {
  LeftStickHorizontal = 0,
  LeftStickVertical,
  RightStickHorizontal,
  RightStickVertical,
}

// The standard doesn't talk about xbox triggers, but firefox has added them as axes
// ref: https://luser.github.io/gamepadtest/
//      https://bugzilla.mozilla.org/show_bug.cgi?id=1434408
export enum Triggers {
  Left = 4,
  Right
}

function buttonToGroupName(button: ExtendedButton) {
  switch (button) {
    case ExtendedButton.RightClusterBottomButton: return "Right Cluster";
    case ExtendedButton.RightClusterRightButton: return "Right Cluster";
    case ExtendedButton.RightClusterLeftButton: return "Right Cluster";
    case ExtendedButton.RightClusterTopButton: return "Right Cluster";
    case ExtendedButton.TopLeftButton: return "Front Cluster";
    case ExtendedButton.TopRightButton: return "Front Cluster";
    case ExtendedButton.BottomLeftButton: return "Front Cluster";
    case ExtendedButton.BottomRightButton: return "Front Cluster";
    case ExtendedButton.CenterClusterLeftButton: return "Center Cluster";
    case ExtendedButton.CenterClusterRightButton: return "Center Cluster";
    case ExtendedButton.LeftStickButton: return "Joystick Button";
    case ExtendedButton.RightStickButton: return "Joystick Button";
    case ExtendedButton.LeftClusterTopButton: return "Left Cluster";
    case ExtendedButton.LeftClusterBottomButton: return "Left Cluster";
    case ExtendedButton.LeftClusterLeftButton: return "Left Cluster";
    case ExtendedButton.LeftClusterRightButton: return "Left Cluster";
    case ExtendedButton.CenterButton: return "Center Cluster";
    case ExtendedButton.LeftStickBottomDirection: return "Left Joystick Directions";
    case ExtendedButton.LeftStickRightDirection: return "Left Joystick Directions";
    case ExtendedButton.LeftStickLeftDirection: return "Left Joystick Directions";
    case ExtendedButton.LeftStickTopDirection: return "Left Joystick Directions";
    case ExtendedButton.RightStickBottomDirection: return "Right Joystick Directions";
    case ExtendedButton.RightStickRightDirection: return "Right Joystick Directions";
    case ExtendedButton.RightStickLeftDirection: return "Right Joystick Directions";
    case ExtendedButton.RightStickTopDirection: return "Right Joystick Directions";
    case ExtendedButton.TriggerLeft: return "Triggers";
    case ExtendedButton.TriggerRight: return "Triggers";
  }
}

export const mockMappings: Map<string, Mapping> = new Map([
  [v7(), {
    name: "Lain PSP game",
    url: "https://blah.com",
    enabled: true,
    mappings: [
      { gamepad: ExtendedButton.RightClusterRightButton, keyboard: 'k' }
    ]
  }],
  [v7(), {
    name: "Some really really long name of the game",
    url: "https://blah.com/*",
    enabled: false,
    mappings: [
      { gamepad: ExtendedButton.LeftClusterLeftButton, keyboard: 'h' }
    ]
  }]
]);

export const mockMappingsList: MappingList = [...mockMappings.entries().map(([uuid, { name }]) => ({
  uuid, name
}))];
