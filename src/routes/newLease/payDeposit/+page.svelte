<script lang="ts">
    import { PUBLIC_COMPANY_NAME, PUBLIC_STRIPE_TEST } from '$env/static/public';
    import Invoice from '$lib/displayComponents/Invoice.svelte';
    import { Elements, PaymentElement, LinkAuthenticationElement, Address, } from 'svelte-stripe';
    import { onMount } from 'svelte';
    import { loadStripe } from '@stripe/stripe-js'
    import type { StripeElements, Stripe } from '@stripe/stripe-js'

    import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { defaultValues } from 'sveltekit-superforms';

    let { data }: { data: PageData } = $props();

    let stripe:Stripe | null;
    let clientSecret: string;
    let elements:StripeElements;
    let error = null;
    let processing = $state(false);
    let mounted = $state(false);

    onMount(async () =>{
        stripe = await loadStripe(PUBLIC_STRIPE_TEST);
        clientSecret = await createPaymentIntent();
        mounted = true;
    })
    async function createPaymentIntent() {
        const response = await fetch('/api/stripe/paymentIntent?invoiceId=' + data.invoice?.invoiceId, {
            method: 'POST',
            headers: {
                'content-type': 'applications/json'
            },
            body:JSON.stringify({ price:data.invoice?.invoiceAmount})
        });
        const clientSecret = await response.json();
        return clientSecret;
    }
    async function submit() {
        if(processing){
            return;
        }
        processing = true;
        const result = await stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        });
        if(result.error){
            error = result.error;
            processing = false;
        } else {
            goto('/newLease/leaseSent?invoiceId=' + data.invoice?.invoiceId);
        }

    }
</script>
<svelte:head>
	<title>{PUBLIC_COMPANY_NAME} | Pay your deposit</title>
</svelte:head>

{#if !mounted}
    ...loading
    {:else}
    {#if data.invoice}
    <Invoice invoice={data.invoice} />
    {/if}
    <Elements {stripe} clientSecret={clientSecret} bind:elements >
        <form onsubmit={submit}>
            {#if data.user?.email}
                <LinkAuthenticationElement defaultValues={{email:data.user.email}} />
            {/if}
            <PaymentElement />
            {#if data.address}
                <Address
                    mode='billing'
                    display={{name: 'split'}}
                    defaultValues={{
                        firstName: data.user?.givenName,
                        lastName: data.user?.familyName,
                        address: {
                            line1: data.address?.address1,
                            line2: data.address?.address2,
                            city: data.address?.city,
                            state: data.address?.state,
                            postal_code: data.address?.zip,
                            country: data.address.country!
                        }
                    }}
                />
            {/if}
        </form>
    </Elements>
{/if}