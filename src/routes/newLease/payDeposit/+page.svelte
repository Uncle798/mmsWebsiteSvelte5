<script lang="ts">
    import { PUBLIC_COMPANY_NAME, PUBLIC_STRIPE_TEST, PUBLIC_URL } from '$env/static/public';
    import Invoice from '$lib/displayComponents/Invoice.svelte';
    import { Elements, PaymentElement, LinkAuthenticationElement, Address, } from 'svelte-stripe';
    import { onMount } from 'svelte';
    import { loadStripe } from '@stripe/stripe-js'
    import type { StripeElements, Stripe } from '@stripe/stripe-js'

    import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';


    let { data }: { data: PageData } = $props();

    let stripe:Stripe | null = $state(null);
    let clientSecret: string = $state('');
    let elements:StripeElements | undefined = $state();
    let error = null;
    let processing = $state(false);
    let mounted = $state(false);

    onMount(async () =>{
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
            body:JSON.stringify({ price:data.invoice?.invoiceAmount, stripeId:data.stripeId, })
        });
        const clientSecret = await response.json();
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
        const result = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams:{
                return_url:`${PUBLIC_URL}/newLease/leaseSent?invoiceNum=${data.invoice?.invoiceNum}`
            }
        });
        if(result.error){
            error = result.error;
            processing = false;
        } else {
            goto('/newLease/leaseSent?invoiceNum=' + data.invoice?.invoiceNum);
        }

    }
    
</script>
<Header title='Pay your deposit'/>
{#if !mounted}
    <div transition:fade={{duration:600}}>
        ...loading
    </div>
    {:else}
    {#if data.invoice}
        <Invoice invoice={data.invoice} />
        <div class="p-4">
            
            <form onsubmit={submit}>
                <Elements {stripe} clientSecret={clientSecret} bind:elements >
                    <!-- {#if data.user?.email}
                    <LinkAuthenticationElement defaultValues={{email:data.user.email}} />
                    {/if} -->
                    <PaymentElement />
                    {#if processing}
                    processing...
                    {:else}
                    <button class="btn" onclick={submit}>Pay deposit of ${data.invoice?.invoiceAmount}</button>
                    {/if}
                </Elements>
            </form>
        </div>
    {/if}
{/if}