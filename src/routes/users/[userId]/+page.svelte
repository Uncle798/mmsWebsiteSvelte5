<script lang="ts">
    import Address from '$lib/displayComponents/Address.svelte';
	import Invoice from '$lib/displayComponents/Invoice.svelte';
	import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
import User from '$lib/displayComponents/User.svelte';
import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.dbUser}
   <User user={data.dbUser}/>
   {:else}
   ...loading user
{/if}
{#await data.addressPromise}
   ...loading address
{:then address}
   {#if address}
   <Address address={address}/>
   {/if}
{/await}

{#await data.leasesPromise}
   ...loading leases
{:then leases}
   {#if leases} 
      {#each leases as lease}
         <LeaseEmployee lease={lease} customer={data.dbUser}/>
      {/each}
   {/if}
{/await}
{#await data.invoicesPromise}
   ...loading invoices
{:then invoices}
   {#if invoices} 
      {#each invoices as invoice}
         <Invoice invoice={invoice} />
      {/each}
   {/if}
{/await}