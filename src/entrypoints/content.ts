export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // TODO: check wxt docs to check if this is a debug build
    let isDebug = true;
    if (isDebug) {
      console.clear()
      console.log("setting up the listener")
      window.addEventListener('keydown', ({ key }) => {
        console.log({
          event: 'keydown', key
        })
      })

      window.addEventListener('keyup', ({ key }) => {
        console.log({
          event: 'keyup', key
        })
      })
    }

    const context = loadEventDispatcherContext();

    window.addEventListener('gamepadconnected', async ({ gamepad }) => {
      if (isDebug) {
        console.clear()
        console.log({ gamepad })
      }
      requestAnimationFrame(time => gameLoop({ gamepad, time, context }))
    })
  },
});

// The "standard" mapping for buttons from the gamepad api standard
// ref: https://w3c.github.io/gamepad/#remapping
enum StandardButtonMapping {
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

// The "standard" mapping for buttons from the gamepad api standard
// ref: https://w3c.github.io/gamepad/#remapping
enum StandardAxesMapping {
  LeftStickHorizontal = 0,
  LeftStickVertical,
  RightStickHorizontal,
  RightStickVertical,
}

// The standard doesn't talk about xbox triggers, but firefox has added them as axes
// ref: https://luser.github.io/gamepadtest/
//      https://bugzilla.mozilla.org/show_bug.cgi?id=1434408
enum Triggers {
  Left = 4,
  Right
}

type TriggerButton = {
  readonly pressed: boolean
}

const ACTIVATION_THRESHOLD = 0.9;
function computeTriggerButton(gamepad: { axes: Gamepad["axes"] }): Record<Triggers, TriggerButton> {
  return {
    [Triggers.Left]: {
      pressed: gamepad.axes[Triggers.Left] >= ACTIVATION_THRESHOLD
    },
    [Triggers.Right]: {
      pressed: gamepad.axes[Triggers.Right] >= ACTIVATION_THRESHOLD
    }
  }
}

type TriggerButtonChange = Record<keyof TriggerButton, boolean>
function diffTriggerButtons(previous: TriggerButton | null, current: TriggerButton): TriggerButtonChange {
  if (previous === null) {
    return {
      pressed: true,
    }
  }

  return {
    pressed: previous.pressed !== current.pressed
  }
}

type GamepadButtonChanges = Record<keyof GamepadButton, boolean>

function diffGameButtonState(previous: GamepadButton | null, current: GamepadButton): GamepadButtonChanges {
  if (previous === null) {
    return {
      pressed: true,
      touched: true,
      value: true,
    }
  }

  return {
    pressed: previous.pressed !== current.pressed,
    touched: previous.touched !== current.touched,
    value: previous.value !== current.value,
  }
}

function isDifferentFloat(a: number, b: number): boolean {
  // created separate function in case i wanna do near-about checks instead of straight equality check
  return a !== b
}

function diffGameAxesState(previous: number | null, current: number): boolean {
  if (previous === null) {
    return true
  }

  return isDifferentFloat(previous, current)
}

type FauxAxesAsButtonChange = Record<keyof FauxAxesAsButton, boolean>

function diffGameFauxAxesAsButtonState(previous: FauxAxesAsButton | null, current: FauxAxesAsButton): FauxAxesAsButtonChange {
  if (previous === null) {
    return {
      pressed: true
    }
  }

  return {
    pressed: previous.pressed !== current.pressed
  }
}

type EventDispatcherContext = {
  // whatever information is needed to dispatch the correct event
  //
  // will most probably include user configuration. but for now, will keep it
  // simple.
  buttonKeymap: Record<StandardButtonMapping, KeyboardEventInit | null>,
  axesKeymap: Record<StandardAxesMapping, null>, // unused for now
  triggerKeymap: Record<Triggers, KeyboardEventInit | null>
  axesAsButtons: true, // for now that's all that's available
}

type GameLoopContext = {
  context: EventDispatcherContext,
  gamepad: Gamepad,
  previousGamepad?: CloneableGamepad,
  time: DOMHighResTimeStamp,
}

type CloneableGampepadButton = {
  readonly [index in keyof GamepadButton]: GamepadButton[index]
}

type FauxAxesAsButton = {
  readonly pressed: boolean;
};

type FauxAxesAsButtons = Record<
  StandardButtonMapping.LeftClusterBottomButton |
  StandardButtonMapping.LeftClusterLeftButton |
  StandardButtonMapping.LeftClusterRightButton |
  StandardButtonMapping.LeftClusterTopButton,
  FauxAxesAsButton
>;

type CloneableGamepad = {
  readonly buttons: CloneableGampepadButton[],
  readonly axes: Gamepad["axes"]
  readonly fauxAxesAsButtons: FauxAxesAsButtons
}

function cloneGamepad(gamepad: Gamepad, fauxAxesAsButtons: FauxAxesAsButtons): CloneableGamepad {
  const buttons: CloneableGampepadButton[] = gamepad.buttons.map(({ pressed, touched, value }) => ({
    pressed, touched, value
  }))

  const axes = structuredClone(gamepad.axes);

  return { buttons, axes, fauxAxesAsButtons }
}

function computeFauxAxesAsButtons(gamepad: Gamepad): FauxAxesAsButtons {
  // we define a ring thats inset the joysticks. if the joystick is inside that
  // ring, it will be considered as being pressed, otherwise not
  const RING_WIDTH = 0.15 // [0, 1]
  const vertical = gamepad.axes[StandardAxesMapping.LeftStickVertical];
  const top = vertical < (-1 + RING_WIDTH);
  const bottom = vertical > (1 - RING_WIDTH);

  const horizontal = gamepad.axes[StandardAxesMapping.LeftStickHorizontal];
  const left = horizontal < (-1 + RING_WIDTH);
  const right = horizontal > (1 - RING_WIDTH);

  return {
    [StandardButtonMapping.LeftClusterTopButton]: {
      pressed: top
    },
    [StandardButtonMapping.LeftClusterBottomButton]: {
      pressed: bottom
    },
    [StandardButtonMapping.LeftClusterLeftButton]: {
      pressed: left
    },
    [StandardButtonMapping.LeftClusterRightButton]: {
      pressed: right
    }
  }
}

function gameLoop({ gamepad, previousGamepad: previous, context }: GameLoopContext) {
  const fauxAxesAsButtons = computeFauxAxesAsButtons(gamepad)
  const triggerButtons = computeTriggerButton(gamepad)
  const current = cloneGamepad(gamepad, fauxAxesAsButtons)
  // we request early to make sure we dont end up missing the next animation
  // frame while processing
  // 
  // tho, since we will be throwing out lots of dom events, it might make more
  // sense to request animation frame _after_ events are dispatched
  requestAnimationFrame(time => gameLoop({ gamepad, previousGamepad: current, time, context }))



  if (typeof previous === "undefined") {
    // most probably the very first iteration
    // dropping for now, but decide if it makes sense to handle the case where
    // the user keeps holding the button until the second iteration which will
    // cause a keyup event to be dispatched before a keydown event
    return
  }

  const buttonChanges = previous.buttons.map((previous, idx) => diffGameButtonState(previous, current.buttons[idx]))

  // ugly code but meh
  const fauxAxesAsButtonsChanges: [keyof FauxAxesAsButtons, FauxAxesAsButtonChange][] | null = (previous && ([
    StandardButtonMapping.LeftClusterBottomButton,
    StandardButtonMapping.LeftClusterLeftButton,
    StandardButtonMapping.LeftClusterRightButton,
    StandardButtonMapping.LeftClusterTopButton
  ] as const).map(key => {
    return [key, diffGameFauxAxesAsButtonState(previous?.fauxAxesAsButtons[key], fauxAxesAsButtons[key])]
  }))

  const previousTriggerButtons = computeTriggerButton(previous)
  const triggerButtonsChanges: [Triggers, TriggerButtonChange][] = ([Triggers.Left, Triggers.Right] as const).map(key => [key, diffTriggerButtons(previousTriggerButtons[key], triggerButtons[key])])

  buttonChanges.forEach(({ pressed: pressedStateChanged }, idx) => {
    const button: StandardButtonMapping = idx; // pinky promise, type shi
    const eventInitDict = context.buttonKeymap[button]
    if (!pressedStateChanged || eventInitDict === null) {
      return
    }

    const eventType = gamepad.buttons[button].pressed ? "keydown" : "keyup"

    const event = new KeyboardEvent(eventType, eventInitDict)

    window.dispatchEvent(event)
  })

  fauxAxesAsButtonsChanges.forEach(([key, { pressed: pressedStateChanged }]) => {
    const eventInitDict = context.buttonKeymap[key]
    if (!pressedStateChanged || eventInitDict === null) {
      return
    }

    const eventType = fauxAxesAsButtons[key].pressed ? "keydown" : "keyup"

    const event = new KeyboardEvent(eventType, eventInitDict)

    window.dispatchEvent(event)
  })

  triggerButtonsChanges.forEach(([key, { pressed: pressedStateChanged }]) => {
    const eventInitDict = context.triggerKeymap[key]
    if (!pressedStateChanged || eventInitDict === null) {
      return
    }

    const eventType = triggerButtons[key].pressed ? "keydown" : "keyup"

    const event = new KeyboardEvent(eventType, eventInitDict)

    window.dispatchEvent(event)
  })
}

function loadEventDispatcherContext(): EventDispatcherContext {
  return {
    buttonKeymap: {
      [StandardButtonMapping.RightClusterBottomButton]: {
        key: 'z'
      },
      [StandardButtonMapping.RightClusterRightButton]: {
        key: 'x'
      },
      [StandardButtonMapping.RightClusterLeftButton]: {
        key: 's'
      },
      [StandardButtonMapping.RightClusterTopButton]: {
        key: 'd'
      },
      [StandardButtonMapping.TopLeftButton]: {
        key: 'w'
      },
      [StandardButtonMapping.TopRightButton]: {
        key: 'r'
      },
      [StandardButtonMapping.BottomLeftButton]: null,
      [StandardButtonMapping.BottomRightButton]: null,
      [StandardButtonMapping.CenterClusterLeftButton]: {
        key: 'c'
      },
      [StandardButtonMapping.CenterClusterRightButton]: {
        key: 'v'
      },
      [StandardButtonMapping.LeftStickButton]: null,
      [StandardButtonMapping.RightStickButton]: null,
      [StandardButtonMapping.LeftClusterBottomButton]: {
        key: 'ArrowDown'
      },
      [StandardButtonMapping.LeftClusterRightButton]: {
        key: 'ArrowRight'
      },
      [StandardButtonMapping.LeftClusterLeftButton]: {
        key: 'ArrowLeft'
      },
      [StandardButtonMapping.LeftClusterTopButton]: {
        key: 'ArrowUp'
      },
      [StandardButtonMapping.CenterButton]: null
    },
    axesKeymap: {
      [StandardAxesMapping.LeftStickHorizontal]: null,
      [StandardAxesMapping.LeftStickVertical]: null,
      [StandardAxesMapping.RightStickHorizontal]: null,
      [StandardAxesMapping.RightStickVertical]: null
    },
    triggerKeymap: {
      [Triggers.Left]: {
        key: 'e'
      },
      [Triggers.Right]: {
        key: 't'
      }
    },
    axesAsButtons: true
  }
}

