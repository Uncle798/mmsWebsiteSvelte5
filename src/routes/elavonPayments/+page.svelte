
<script lang="ts">
	import { mount, onMount } from 'svelte';
   import type { PageData } from './$types';
	import CreditCardForm from '$lib/forms/CreditCardForm.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';

   let { data }: { data: PageData } = $props();
   let sessionToken = $state('');
   let mounted = $state(false);
   let processing = $state(false)
   onMount(async () => {
      sessionToken = await getSessionToken();
      setTimeout(() => {
         location.reload();
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
{#if !mount}
   <div>
      Loading...
   </div>

{:else}
<div class="flex flex-col m-2">
   <InvoiceCustomer
      invoice={data.invoice}
      classes='m-2 border border-primary-50-950 rounded-lg'
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