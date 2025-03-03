<script lang="ts">
    import { PUBLIC_STRIPE_TEST, PUBLIC_URL } from '$env/static/public';
    import { Elements, PaymentElement, } from 'svelte-stripe';
    import { onMount } from 'svelte';
    import { loadStripe } from '@stripe/stripe-js'
    import type { StripeElements, Stripe } from '@stripe/stripe-js'

    import type { PageData } from './$types';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';

    let { data }: { data: PageData } = $props();

    let stripe:Stripe | null = $state(null);
    let clientSecret: string = $state('');
    let elements:StripeElements | undefined = $state();
    let error = null;
    let processing = $state(false);
    let mounted = $state(false);
    // let currentTime = $state(new Date());
    onMount(async () =>{
        // const interval = setInterval(() =>{
        //     currentTime = new Date();
        // }, 1000)
        stripe = await loadStripe(PUBLIC_STRIPE_TEST);
        clientSecret = await createPaymentIntent();
        mounted = true;
    })
    async function createPaymentIntent() {
        const response = await fetch(`/api/stripe/paymentIntent?invoiceNum=${data.invoice?.invoiceNum}`, {
            method: 'POST',
            headers: {
                'content-type': 'applications/json'
            },
            body:JSON.stringify({ customerId:data.customer?.id, invoiceNum:data.invoice?.invoiceNum, subscription:data.subscription })
        });
        const {clientSecret} = await response.json();
        return clientSecret;
    }
    async function submit() {
        if(processing){
            return;
        }
        processing = true;
        if(!stripe){
            return;
        }
        elements?.submit();
        let returnURL = `${PUBLIC_URL}/thanks?invoiceNum=${data.invoice?.invoiceNum}`
        if(data.newLease){
            returnURL = `${PUBLIC_URL}/newLease/leaseSent?invoiceNum=${data.invoice?.invoiceNum}`
        }
        let result;
        if(data.subscription){
            result = await stripe.confirmSetup({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: returnURL
                }
            })
        } else {
            result = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams:{
                    return_url: returnURL
                }
            });
        }
        if(result.error){
            error = result.error;
            processing = false;
        } 
    }
    
</script>
<Header title='Make a Payment'/>

{#if !mounted}
    <div transition:fade={{duration:600}} class="mt-10">
        ...loading
    </div>
    {:else}
    {#if data.invoice}
        <InvoiceCustomer invoice={data.invoice} classes='mx-1 sm:mx-2 mt-10'/>
        <div class="mx-1 sm:mx-2">
            
            <form onsubmit={submit}>
                <Elements {stripe} clientSecret={clientSecret} bind:elements >
                    <!-- {#if data.user?.email}
                    <LinkAuthenticationElement defaultValues={{email:data.user.email}} />
                    {/if} -->
                    <PaymentElement />
                    {#if processing}
                        <div class="p-4">Processing...</div>
                    {:else}
                        <button class="btn preset-filled-primary-50-950 rounded-lg mt-2" onclick={submit}>Pay charge of ${data.invoice?.invoiceAmount}</button>
                    {/if}
                </Elements>
            </form>
        </div>
    {/if}
{/if}