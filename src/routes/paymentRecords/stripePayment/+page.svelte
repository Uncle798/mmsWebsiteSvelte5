<!-- <script lang="ts">
   import type { PageData } from './$types';
	import { loadStripe, type StripeElements, type Stripe } from '@stripe/stripe-js';
	import { onMount } from 'svelte';
	import { PUBLIC_STRIPE_TEST, PUBLIC_URL } from '$env/static/public';
   import Header from '$lib/Header.svelte';
   import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import { Elements, PaymentElement } from 'svelte-stripe';
	import { goto } from '$app/navigation';
	import PaymentRecord from '$lib/displayComponents/PaymentRecordEmployee.svelte';

    let { data }: { data: PageData } = $props();
    let stripe:Stripe | null = $state(null);
    let clientSecret: string = $state('');
    let elements:StripeElements | undefined = $state();
    let error = null;
    let processing = $state(false);
    let mounted = $state(false);

    onMount(async () => {
      stripe = await loadStripe(PUBLIC_STRIPE_TEST);
      clientSecret = await createPaymentIntent();
      mounted = true;
    })
   async function createPaymentIntent() {
      const response = await fetch('/api/stripe/paymentIntent?invoiceNum=' + data.paymentRecord?.invoiceNum, {
         method: 'POST',
         headers: {
            'content-type': 'applications/json'
         },
         body: JSON.stringify({ price: data.paymentRecord?.paymentAmount })
      })
      const clientSecret = await response.json();
      return clientSecret;
   }
   async function submit() {
      if(processing){
         return
      }
      processing = true;
      if(!stripe){
         return;
      }
      elements?.submit();
      const result = await stripe.confirmPayment({
         elements,
         clientSecret,
         confirmParams: {
            return_url: `${PUBLIC_URL}/paymentRecords/${data.paymentRecord?.paymentNumber}`
         }
      });
      if(result.error){
         error = result.error;
         processing = false;
      } else {
         goto('/paymentRecords/'+data.paymentRecord?.paymentNumber)
      }
   }
</script>

<Header title='Make a payment'/>
{#if !mounted}
    ...loading
    {:else}
    {#if data.paymentRecord}
      <PaymentRecord paymentRecord={data.paymentRecord} />
        <div class="p-4">
            <form onsubmit={submit}>
                <Elements {stripe} clientSecret={clientSecret} bind:elements >

                    <PaymentElement />
                    {#if processing}
                     processing...
                    {:else}
                     <button class="btn" onclick={submit}>Charge ${data.paymentRecord?.paymentAmount}</button>
                    {/if}
                </Elements>
            </form>
        </div>
    {/if}
{/if} -->