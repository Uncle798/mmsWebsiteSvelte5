<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import PaymentRecord from '$lib/displayComponents/PaymentRecord.svelte';
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>

<Header title='Recently Moved Out' />

{#each data.leases as lease}
   {@const invoice = data.invoices.find((invoice) => invoice.leaseId === lease.leaseId)}
   {@const paymentRecord = data.paymentRecords.find((paymentRecord) => paymentRecord.invoiceNum === invoice?.invoiceNum)}
   <LeaseEmployee lease={lease} />
   {#if paymentRecord}
      <PaymentRecord paymentRecord={paymentRecord}/>
   {/if}
{/each}
