<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index";
  import Button from "$lib/components/ui/button/button.svelte";
  import {
    isValidUrlPattern,
    mockMappings,
    mockMappingsList,
    type Mapping,
  } from "$lib/store";
  import { Plus } from "@lucide/svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { cn } from "$lib/utils";
  import { v7 } from "uuid";
  import { derived as derivedStore, writable } from "svelte/store";
  import SidebarMenuButton from "$lib/components/ui/sidebar/sidebar-menu-button.svelte";
  import Switch from "$lib/components/ui/switch/switch.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import Input from "$lib/components/ui/input/input.svelte";

  let mappings = writable(mockMappings);
  let mappingsList = derivedStore(mappings, (mappings) => [
    ...mappings.entries().map(([uuid, { name }]) => ({ uuid, name })),
  ]);
  let selectedMappingUuid = $state<string | null>(null);
  let selectedMapping = $derived(
    selectedMappingUuid === null
      ? null
      : ($mappings.get(selectedMappingUuid) ?? null),
  );
  let delta = $state<Partial<Mapping>>({});
  let hasChanges = $derived(Object.keys(delta).length !== 0);
  let urlInput = $state<string | null>(null);
  let urlIsInvalid = $derived.by(() => {
    if (urlInput === null) {
      return null;
    }

    let validity = isValidUrlPattern(urlInput);

    return "err" in validity;
  });

  function selectMapping(uuid: string) {
    delta = {};
    selectedMappingUuid = uuid;
    urlInput = selectedMapping?.url ?? null;
  }

  function createMapping() {
    mappings.update((mappings) => {
      mappings.set(v7(), {
        name: "auto created",
        url: "http://asdfa",
        enabled: true,
        mappings: [],
      });

      return mappings;
    });
  }

  function setEnabledForCurrent(enable: boolean) {
    mappings.update((mappings) => {
      if (selectedMappingUuid == null) {
        return mappings;
      }
      mappings.set(selectedMappingUuid, {
        ...selectedMapping!,
        enabled: enable,
      });

      return mappings;
    });
  }

  function stageUrlToDelta(url: string) {
    if (urlIsInvalid === null || urlIsInvalid) {
      return;
    }

    if (selectedMapping !== null && url === selectedMapping.url) {
      delete delta.url;
      return;
    }

    delta = {
      ...delta,
      url,
    };
  }

  function saveChangesForCurrent() {
    mappings.update((mappings) => {
      if (selectedMappingUuid == null) {
        return mappings;
      }
      mappings.set(selectedMappingUuid, {
        ...selectedMapping!,
        ...delta,
      });

      return mappings;
    });

    delta = {};
  }
</script>

{#snippet listItem(name: string, uuid: string, selected: boolean)}
  <Button
    variant={selected ? "default" : "outline"}
    class={cn(
      "cursor-pointer w-full justify-start rounded border",
      selected && "border border-primary",
    )}
    onclick={() => selectMapping(uuid)}
  >
    <p class="truncate">{name}</p>
  </Button>
{/snippet}

{#snippet mapper(label: string)}
  <Button class="rounded" size="sm" variant="secondary">{label}</Button>
{/snippet}

{#snippet mappingInput(mapping: Mapping)}
  <div class="flex flex-col mx-4 gap-4">
    <section id="header" class="flex justify-between">
      <h1 class="self-center">{mapping.name}</h1>
      <div class="flex gap-4">
        <div>
          <Label
            class="bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border h-9 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 rounded p-4 cursor-pointer"
            for="enable"
          >
            <Switch
              onCheckedChange={(state) => setEnabledForCurrent(state)}
              checked={mapping.enabled}
              id="enable"
              class="cursor-pointer"
            />
            Enabled
          </Label>
        </div>
        <Button
          onclick={() => saveChangesForCurrent()}
          disabled={!hasChanges || urlIsInvalid === true}
          class="rounded cursor-pointer">Save Changes</Button
        >
      </div>
    </section>
    <section id="url-pattern-section">
      <div class="flex flex-col gap-2">
        <Label for="url-pattern">URL</Label>
        <Input
          aria-invalid={urlIsInvalid}
          id="url-pattern"
          type="text"
          class="rounded"
          bind:value={urlInput}
          oninput={() => urlInput && stageUrlToDelta(urlInput)}
          placeholder="https://example.com or good ol' regex"
        />
        <p class="text-sm text-foreground/50">
          {urlIsInvalid
            ? "The pattern is invalid"
            : "The url pattern where this mapping will be applied"}
        </p>
      </div>
    </section>
    <section class="gamepad-mapping">
      <section>
        <h2>Left Button Cluster</h2>
        <div>
          {@render mapper("Top Button")}
        </div>
      </section>
    </section>
  </div>
{/snippet}

<div class="w-full h-full py-4 border border-dashed rounded">
  <Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane defaultSize={25}>
      <div class="sidebar px-2 mx-2">
        <div class="sidebar-header">
          <Button
            class="rounded cursor-pointer w-full"
            size="lg"
            onclick={() => createMapping()}
          >
            <Plus />
            <span>Create Mapping</span>
          </Button>
        </div>
        {#if $mappingsList.length > 0}
          <ScrollArea class="mapping-list">
            <div class="flex flex-col gap-2 my-4">
              {#each $mappingsList as { name, uuid }}
                {@render listItem(name, uuid, selectedMappingUuid === uuid)}
              {/each}
            </div>
          </ScrollArea>
        {:else}
          <div class="size-full grid place-items-center">
            <span class="text-secondary"
              >All your mappings will show up here
            </span>
          </div>
        {/if}
      </div>
    </Resizable.Pane>
    <Resizable.Handle />
    <Resizable.Pane>
      {#if selectedMapping}
        <ScrollArea
          orientation="vertical"
          style={{ height: "calc(80vh - 2rem)" }}
        >
          {@render mappingInput(selectedMapping)}
        </ScrollArea>
      {:else}
        <div
          class="size-full grid place-items-center text-secondary-foreground"
        >
          no mapping selected
        </div>
      {/if}
    </Resizable.Pane>
  </Resizable.PaneGroup>
</div>
