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

type EventDispatcherContext = {
  // whatever information is needed to dispatch the correct event
  //
  // will most probably include user configuration. but for now, will keep it
  // simple.
  buttonKeymap: Record<StandardButtonMapping, KeyboardEventInit | null>,
  axesKeymap: Record<StandardAxesMapping, KeyboardEventInit | null>,
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

type CloneableGamepad = {
  readonly buttons: CloneableGampepadButton[],
  readonly axes: Gamepad["axes"]
}

function cloneGamepad(gamepad: Gamepad): CloneableGamepad {
  const buttons: CloneableGampepadButton[] = gamepad.buttons.map(({ pressed, touched, value }) => ({
    pressed, touched, value
  }))

  const axes = structuredClone(gamepad.axes);

  return { buttons, axes }
}

function gameLoop({ gamepad, previousGamepad: previous, context }: GameLoopContext) {
  const current = cloneGamepad(gamepad)
  // we request early to make sure we dont end up missing the next animation
  // frame while processing
  // 
  // since we will be throwing out lots of dom events, it might make more sense
  // to request animation frame _after_ events are dispatched
  requestAnimationFrame(time => gameLoop({ gamepad, previousGamepad: current, time, context }))

  // - [x] map game button to key
  // - [x] map axes to direction
  // - [x] use diffing to find what has changed since the last iteration
  // - [ ] use threshold for axes to register as change
  // - [ ] for every change, trigger an event on window

  const buttonChanges = previous?.buttons?.map((previous, idx) => diffGameButtonState(previous ?? null, current.buttons[idx])) ?? null
  const axesChnages = previous?.axes?.map((previous, idx) => diffGameAxesState(previous ?? null, current.axes[idx])) ?? null

  if (buttonChanges === null || axesChnages === null) {
    // most probably the very first iteration
    // dropping for now, but decide if it makes sense to handle the case where the user keeps holding the button until the second iteration
    // which will cause a keyup event to be dispatched before a keydown event
    return
  }

  buttonChanges.forEach(({ pressed: pressedStateChanged }, idx) => {
    const button: StandardButtonMapping = idx; // pinky promise, type shi
    const eventInitDict = context.buttonKeymap[button]
    if (!pressedStateChanged || eventInitDict === null) {
      return
    }

    const eventType = gamepad.buttons[button].pressed ? "keypress" : "keydown"

    const event = new KeyboardEvent(eventType, eventInitDict)

    window.dispatchEvent(event)
  })
}

function loadEventDispatcherContext(): EventDispatcherContext {
  return {
    buttonKeymap: {
      [StandardButtonMapping.RightClusterBottomButton]: null,
      [StandardButtonMapping.RightClusterRightButton]: null,
      [StandardButtonMapping.RightClusterLeftButton]: null,
      [StandardButtonMapping.RightClusterTopButton]: null,
      [StandardButtonMapping.TopLeftButton]: null,
      [StandardButtonMapping.TopRightButton]: null,
      [StandardButtonMapping.BottomLeftButton]: null,
      [StandardButtonMapping.BottomRightButton]: null,
      [StandardButtonMapping.CenterClusterLeftButton]: null,
      [StandardButtonMapping.CenterClusterRightButton]: null,
      [StandardButtonMapping.LeftStickButton]: null,
      [StandardButtonMapping.RightStickButton]: null,
      [StandardButtonMapping.LeftClusterBottomButton]: {
        key: "ArrowDown"
      },
      [StandardButtonMapping.LeftClusterRightButton]: {
        key: "ArrowRight"
      },
      [StandardButtonMapping.LeftClusterLeftButton]: {
        key: "ArrowLeft"
      },
      [StandardButtonMapping.LeftClusterTopButton]: {
        key: "ArrowTop"
      },
      [StandardButtonMapping.CenterButton]: null
    },
    axesKeymap: {
      [StandardAxesMapping.LeftStickHorizontal]: null,
      [StandardAxesMapping.LeftStickVertical]: null,
      [StandardAxesMapping.RightStickHorizontal]: null,
      [StandardAxesMapping.RightStickVertical]: null
    }
  }
}

