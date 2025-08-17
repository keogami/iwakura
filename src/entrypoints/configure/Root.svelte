<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index";
  import Button from "$lib/components/ui/button/button.svelte";
  import { mockMappings, mockMappingsList } from "$lib/store";
  import { Plus } from "@lucide/svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";

  let selectedMappingUuid = $state<string | null>(null);
  let selectedMapping = $derived(
    selectedMappingUuid === null
      ? null
      : (mockMappings.get(selectedMappingUuid) ?? null),
  );

  function selectMapping(uuid: string) {
    selectedMappingUuid = uuid;
  }
</script>

{#snippet listItem(name: string, uuid: string)}
  <Button
    variant="outline"
    class="cursor-pointer w-full justify-start rounded"
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
          <Button class="rounded cursor-pointer w-full" size="lg">
            <Plus />
            <span>Create Mapping</span>
          </Button>
        </div>
        {#if mockMappingsList.length > 0}
          <ScrollArea class="mapping-list">
            <div class="flex flex-col gap-2 my-4">
              {#each mockMappingsList as { name, uuid }}
                {@render listItem(name, uuid)}
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
