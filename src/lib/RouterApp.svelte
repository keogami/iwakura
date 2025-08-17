<script lang="ts">
  import Button from "./components/ui/button/button.svelte";
  import { currentComponent } from "./router";
  let Component = $currentComponent;
</script>

{#if $currentComponent}
  <main class="w-screen h-screen grid place-items-center">
    <div class="w-4/5 h-4/5 grid place-items-center">
      <Component />
    </div>
  </main>
{:else}
  <main class="w-screen h-screen grid place-items-center">
    <div class="w-4/5 h-4/5 grid place-items-center border-dashed border">
      <div class="flex items-center gap-4 flex-col">
        <img src="/Controller.png" alt="broken controller graphic" />
        <h1 class="text-secondary-foreground">
          Odd... You fell out of the wired
        </h1>
        <Button class="max-w-50" href="#/">Go back in</Button>
      </div>
    </div>
  </main>
{/if}
