<script lang="ts">
    import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import Header from '$lib/Header.svelte';
	import CreditCardForm from '$lib/forms/CreditCardForm.svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';

    let { data }: { data: PageData } = $props();
    let mounted = $state(false);
    let sessionToken = $state('')
    onMount(async ()=>{
        const response = await fetch('/api/elavon', {
            method: 'POST',
            body: JSON.stringify({invoiceNum: data.invoice?.invoiceNum, subscription:true})
        }).then(async (r) => {
            return await r.json()
        })
        sessionToken = response;
        mounted = true
    })

</script>
<Header title="Sign up for auto pay" />
{#if !mounted}
    <div class="mt-12 sm:mt-10 m-1">Loading...</div>
{:else}
    <div class="mt-12 sm:mt-10 sm:mt-12 sm:mt-10 m-1 sm:m-2">
        {#if data.invoice}
            <InvoiceCustomer invoice={data.invoice} />
            <CreditCardForm data={data.creditCardForm} invoice={data.invoice} sessionToken={sessionToken} subscription={true} buttonText={`Start Auto pay of $${data.invoice.invoiceAmount}`}/>
        {/if}
    </div>
{/if}