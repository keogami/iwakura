<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index";
  import Button from "$lib/components/ui/button/button.svelte";
  import { mockMappings, mockMappingsList } from "$lib/store";
  import { Plus } from "@lucide/svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { cn } from "$lib/utils";
  import { v7 } from "uuid";
  import { derived as derivedStore, writable } from "svelte/store";

  let mappings = writable(mockMappings);
  let mappingsList = derivedStore(mappings, (mappings) => [
    ...mappings.entries().map(([uuid, { name }]) => ({ uuid, name })),
  ]);
  let selectedMappingUuid = $state<string | null>(null);
  let selectedMapping = $derived(
    selectedMappingUuid === null
      ? null
      : (mockMappings.get(selectedMappingUuid) ?? null),
  );

  function selectMapping(uuid: string) {
    selectedMappingUuid = uuid;
  }

  function createMapping() {
    mappings.update((mappings) => {
      mappings.set(v7(), {
        name: "auto created",
        url: "http://asdfa",
        mappings: [],
      });

      return mappings;
    });
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

<div class="w-full h-full py-4 border border-dashed rounded">
  <Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane defaultSize={25}>
      <div class="sidebar px-4">
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
        <div class="input-area">selected mapping</div>
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
