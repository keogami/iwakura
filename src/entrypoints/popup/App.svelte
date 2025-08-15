<script>
  import { Button } from "$lib/components/ui/button/index.ts";

  let active = $state({
    name: "Name of this mapping",
    active: true,
    id: "some-uuid-for-the-mapping",
  });
</script>

<main>
  <div class="w-md p-4">
    <Button variant="ghost" class="w-full flex justify-between cursor-pointer">
      <span>
        {active.name}
      </span>
      <div>
        <div class="size-2 rounded-full bg-primary"></div>
      </div>
    </Button>
  </div>
</main>
