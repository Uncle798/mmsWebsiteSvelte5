
<script lang="ts">
	import { onMount } from 'svelte';
   import type { PageData } from './$types';
	import CreditCardForm from '$lib/forms/CreditCardForm.svelte';
	import { invalidate } from '$app/navigation';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';

   let { data }: { data: PageData } = $props();
   let sessionToken = $state('');
   let mounted = $state(false);
   onMount(async () => {
      sessionToken = await getSessionToken();
      setTimeout(() => {
         invalidate('/api/elavon');
      }, 15*60*1000)
      mounted = true
   })

   async function getSessionToken() {
      const response = await fetch('/api/elavon/', {
         method: 'POST',
         headers: {
            'content-type':'applications/json'
         },
         body: JSON.stringify({
            invoiceNum: data.invoice.invoiceNum,
            subscription: data.subscription,
            newLease: data.newLease, 
            leaseId: data.leaseId
         })
      })
      const body = await response.json();
      return body
   }
</script>
{#if !mounted}
   <div class="m-2 mt-14 sm:mt-10">
      Loading...
   </div>
{:else}
   <div class="flex flex-col m-2 gap-2 mt-14 sm:mt-10">
      {#if data.customer}    
         <UserCustomer
            user={data.customer}
         />
      {/if}
      <InvoiceCustomer
         invoice={data.invoice}
         classes='border border-primary-50-950 rounded-lg'
      />
      <CreditCardForm
         data={data.ccForm}
         invoice={data.invoice}
         sessionToken={sessionToken}
         subscription={data.subscription ? true : false}
         buttonText={`Pay $${data.invoice.invoiceAmount}`}
      />
   </div>
{/if}