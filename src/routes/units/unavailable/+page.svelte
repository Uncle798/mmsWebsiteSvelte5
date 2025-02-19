<script lang="ts">
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>
<div class="m-2">
   {#each data.units as unit}
      <UnitEmployee unit={unit} />
      <UnitNotesForm data={data.unitNotesForm} {unit} classes='' />
   {/each}
</div>