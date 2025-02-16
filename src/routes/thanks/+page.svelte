<script lang="ts">
    import type { PageData } from './$types';
    import Header from '$lib/Header.svelte';
    import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
    import Address from '$lib/displayComponents/Address.svelte';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
    let { data }: { data: PageData } = $props();
</script>

<Header title="Thanks!" />
Thanks for your business!

{#if data.paymentRecord}
    <div class="flex border-2 border-primary-50 dark:border-primary-950">
        <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='px-2 w-1/2'/>
        {#if data.customer}
            <div class="flex flex-col border-l-2 border-primary-50 dark:border-primary-950 px-2 pt-2 w-1/2">
                <UserEmployee user={data.customer} />
                {#if data.address}
                    <Address address={data.address} />
                {/if}
            </div>
        {/if}
    </div>
{/if}