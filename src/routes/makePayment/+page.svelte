<script lang="ts">
    import { PUBLIC_STRIPE_TEST, PUBLIC_URL } from '$env/static/public';
    import { onMount } from 'svelte';
    import { loadStripe } from '@stripe/stripe-js'
	import Header from '$lib/Header.svelte';
	import { fade } from 'svelte/transition';
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
    import type { Stripe, StripeEmbeddedCheckout } from '@stripe/stripe-js'
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    let stripe:Stripe | null = $state(null);
    let clientSecret: string = $state('');
    let wrapper:string | HTMLElement = $state('');
    let mounted = $state(false);
    let checkoutElement = $state<StripeEmbeddedCheckout>();
    onMount(async () =>{

        stripe = await loadStripe(PUBLIC_STRIPE_TEST);
        clientSecret = await createCheckout();
        stripe?.initEmbeddedCheckout({clientSecret}).then((element) => {

            checkoutElement = element;
            console.log(checkoutElement)
            checkoutElement.mount(wrapper)
        })
        mounted = true;
    })
    async function createCheckout() {
        const response = await fetch(`/api/stripe/checkoutSession`, {
            method: 'POST',
            headers: {
                'content-type' : 'applications/json'
            },
            body: JSON.stringify({ 
                invoiceNum: data.invoice.invoiceNum, 
                subscription: data.subscription,
                newLease: data.newLease,
                leaseId: data.leaseId,
            })
        })
        const body = await response.json();
        console.log(body)
        return body;
    }
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
    let now = $state(dayjs());
    let end = dayjs().add(15, 'minute');
    let count = $state(end.diff(dayjs(), 'seconds'));
    if(browser){
        setInterval(async ()=>{
            now = dayjs();
            count = end.diff(now, 'second');
            if(count <= 0){
                goto('/')
            }
        }, 1000)
    }
</script>
<Header title='Make a Payment'/>
{#if data.newLease}
    <div class="mt-10">
        {count} seconds left
    </div>
    {#if !mounted}
        <div transition:fade={{duration:600}} class=" m-2">
            ...loading
        </div>
        {:else}
        <div bind:this={wrapper} class="mt-10 m-2"></div>
    {/if}
{:else}
    {#if !mounted}
        <div transition:fade={{duration:600}} class=" m-2">
            ...loading
        </div>
        {:else}
        <div bind:this={wrapper} class="mt-10 m-2"></div>
    {/if}
{/if}