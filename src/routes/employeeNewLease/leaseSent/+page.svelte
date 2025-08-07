<script lang="ts">
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';

    let { data }: { data: PageData } = $props();
</script>
<Header title='Lease Sent' />
<div class='m-2 mt-14 sm:mt-10'>
   The lease has been sent to {data.customer?.email}. Please check {data.user?.email} and sign the lease.
</div>
{#if data.paymentRecord}
<div class="flex flex-col sm:flex-row rounded-lg border-2 border-primary-50-950 m-1 sm:m-2">
   <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='m-1 sm:m-2 sm:w-1/2'/>
   {#if data.customer}
         <div class="m-1 sm:m-2">
            <UserEmployee user={data.customer} />
            {#if data.address}
               <AddressEmployee address={data.address} />
            {/if}
         </div> 
      {/if}
   </div>
{/if}