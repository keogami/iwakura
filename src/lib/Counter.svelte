<script lang="ts">
  import { writable } from "svelte/store";
  import { storage } from "@wxt-dev/storage";

  let count = writable(0);

  storage.getItem("local:counter").then((value) => {
    $count = Number(value);
  });

  storage.watch("local:counter", (currentValue) => {
    $count = Number(currentValue);
  });

  async function increment() {
    await storage.setItem("local:counter", $count + 1);
  }
</script>

<button on:click={increment}>
  count is {$count}
</button>
