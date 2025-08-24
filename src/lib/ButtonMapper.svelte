<script lang="ts">
  import { Gamepad2, MoveRight, Unlink } from "@lucide/svelte";
  import { Button, type ButtonVariant } from "./components/ui/button";
  import { cn } from "./utils";

  function keyToLabel(key: string): string {
    if (key === " ") {
      // special case for space
      return "<space>";
    }

    if (key.length === 1) {
      // most probably a character like `a` or `1`
      return key;
    }

    // probably something like `Backspace` or `Enter`
    return `<${key}>`;
  }

  let {
    label,
    mappedTo = $bindable(null),
    canListen,
    onMappingChange,
    onListeningChange,
  }: {
    label: string;
    mappedTo: string | null;
    canListen: boolean;
    onListeningChange: (listening: boolean) => void;
    onMappingChange: (key: string | null) => void;
  } = $props();

  let listening = $state(false);

  let text = $derived.by(() => {
    if (listening) {
      return "";
    }

    if (mappedTo === null) {
      return "";
    }

    return keyToLabel(mappedTo);
  });

  function startListening() {
    onListeningChange(true);
    listening = true;
    let handle = (e: KeyboardEvent) => {
      e.preventDefault();
      listening = false;
      mappedTo = e.key;
      onMappingChange(e.key);
      removeEventListener("keydown", handle);
      onListeningChange(false);
    };

    addEventListener("keydown", handle);
  }

  let myClass = $derived(
    listening
      ? "size-2 rounded-full bg-primary p-0 m-0 pointer-events-none"
      : cn(
          "w-full",
          mappedTo || "border-dashed",
          mappedTo && "border-primary/20 border",
          !canListen && "pointer-events-none cursor-default",
        ),
  );

  let variant: ButtonVariant = $derived.by(() => {
    if (listening) {
      return "secondary";
    }

    if (mappedTo === null) {
      return "outline";
    }

    return "secondary";
  });

  function unset() {
    mappedTo = null;
    onMappingChange(null);
  }
</script>

<div class="flex gap-2 items-center group">
  <Button class="rounded flex-1" size="sm" variant="secondary"
    ><Gamepad2 /> {label}</Button
  >
  <Button
    onclick={unset}
    variant="ghost"
    size="icon"
    class={cn("rounded cursor-pointer", mappedTo || "pointer-events-none")}
  >
    {#if mappedTo}
      <MoveRight class="group-hover:hidden" />
      <Unlink class="hidden group-hover:block" />
    {:else}
      <MoveRight />
    {/if}
  </Button>
  <div class="rounded min-w-[6rem] flex-1 flex justify-center relative">
    <Button
      id="button-mapper"
      data-listening={listening.toString()}
      onclick={startListening}
      class={cn("duration-300 rounded cursor-pointer uppercase", myClass)}
      size="sm"
      {variant}>{text}</Button
    >
    <span
      id="pinger"
      class={cn(
        "size-8 rounded-full bg-secondary pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 -z-1",
        listening || "opacity-0",
        listening && "animate-ping",
      )}
    ></span>
    <span
      id="spinner"
      class={cn(
        "size-1 duration-150 rounded-full border border-primary border-dashed pointer-events-none absolute top-1/2 left-1/2 -translate-1/2",
        listening || "opacity-0",
        listening && "animate-spin size-6",
      )}
    ></span>
  </div>
</div>

<style>
  #spinner {
    animation-duration: 6s !important;
  }

  #pinger {
    animation-duration: 1.5s !important;
  }

  /* work around to i dont even fucking know what */
  :global #button-mapper {
    font-family: "Fira Mono";
  }
</style>
