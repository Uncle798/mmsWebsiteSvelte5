<script lang="ts">
	import type { Stripe, StripeElementBase } from '@stripe/stripe-js';
    import type { PageData } from './$types';
	import { createEventDispatcher, getContext, mount, onMount } from 'svelte';
	import { loadStripe } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_TEST } from '$env/static/public';
	import Header from '$lib/Header.svelte';

    let { data }: { data: PageData } = $props();
    let stripe:Stripe | null = $state(null);
    let clientSecret:string = $state('');
    let mounted = $state(false);
    let wrapper:string | HTMLElement = $state('');
    let checkoutElement;
    onMount(async () => {
        stripe = await loadStripe(PUBLIC_STRIPE_TEST);
        clientSecret = await createCheckout();
        stripe?.initEmbeddedCheckout({clientSecret}).then((element) => {
            checkoutElement = element;
            checkoutElement.mount(wrapper)
        })
        mounted = true;
    })
    async function createCheckout() {
        const response = await fetch(`/api/stripe/checkoutSession`, {
            method: 'POST',
            headers: {
                'content-type': 'applications/json'
            },
            body: JSON.stringify({userId: data.customer?.id, leaseId: data.lease?.leaseId})
        });
        const clientSecret = await response.json();
        return clientSecret;
    }
</script>
<Header title="Sign up for auto pay" />
{#if !mounted}
    <div class="mt-10">
        ...loading 
    </div>
    {:else}
    <div bind:this={wrapper} class="mt-10"></div>
{/if}