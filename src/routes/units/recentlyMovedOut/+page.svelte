<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
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
      <PaymentRecordEmployee paymentRecord={paymentRecord}/>
   {/if}
{/each}
