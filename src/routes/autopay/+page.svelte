<script lang="ts">
    import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import Header from '$lib/Header.svelte';
	import CreditCardForm from '$lib/forms/CreditCardForm.svelte';

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
    <div class="mt-10">Loading ...</div>
{:else}
    <CreditCardForm data={data.creditCardForm} invoice={data.invoice!} sessionToken={sessionToken} subscription={true} classes='mt-10'/>
{/if}