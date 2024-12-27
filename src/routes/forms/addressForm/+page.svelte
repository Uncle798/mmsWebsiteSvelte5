<script lang="ts">
    import AddressForm from '$lib/forms/AddressForm.svelte';
	import { loadStripe, type Appearance, type Stripe, type StripeAddressElement, type StripeElementBase } from '@stripe/stripe-js';
    import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { PUBLIC_STRIPE_TEST } from '$env/static/public';
	import { superForm } from 'sveltekit-superforms';

    let { data }: { data: PageData } = $props();
    let stripe:Stripe | null = $state(null);
    let mounted = $state(false)
    let wrapper: string | HTMLElement = $state('');
    let element:StripeElementBase | undefined = $state();
    let addressElement:StripeAddressElement | undefined = $state();
    let formData:FormData;
    let checkoutElement;
    // const {form, enhance } = superForm(data.addressForm, {
    //     async onSubmit({formData}){
    //         const values = await addressElement?.getValue();
    //         if(values?.complete){
    //             formData.set('givenName', values.value.firstName!)
    //             formData.set('familyName', values.value.lastName!);

    //         }
    //         console.log(formData);
            
    //     }
    // })
    onMount(async () => {
        stripe = await loadStripe(PUBLIC_STRIPE_TEST);
        const appearance:Appearance = {
            theme: "night",
        };

        const elements = stripe?.elements({appearance});
        const apiKey = await getGoogleApiKey();
        addressElement = elements?.create('address', {
            mode: 'billing', 
            autocomplete: {
                mode: 'google_maps_api',
                apiKey: apiKey
            },
            fields: {
                phone: 'always'
            },
            display: {
                name: 'split'
            }
        })
        addressElement?.mount(wrapper);
        mounted = true;
    })
    async function getGoogleApiKey(){
        const response = await fetch('/api/stripe/googleApi', {
            method: 'POST',
            headers: {
                'content-type': 'applications/json'
            },
            body: JSON.stringify({userId: data.user?.id})
        })
        const apiKey = await response.json();
        return apiKey
    }
    async function submit() {
        const values = await addressElement?.getValue();
        console.log(values)
        formData.set('givenName', values?.value.lastName);
    }
</script>
    <div bind:this={wrapper}></div>
    {#if mounted}
        <button class="btn" onclick={submit}>Submit</button>
    {/if}
