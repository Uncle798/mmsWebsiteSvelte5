<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

<Header title='Lease {data.lease?.leaseId}' />
<div class="flex">
   {#if data.lease}
      <LeaseEmployee lease={data.lease} />
   {/if}
   {#if data.customer}
      <UserEmployee user={data.customer} />
   {/if}
</div>