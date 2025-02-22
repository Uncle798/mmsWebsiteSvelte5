<script lang="ts">
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
    import AddressForm from '$lib/forms/AddressForm.svelte';
    import NameForm from '$lib/forms/NameChangeForm.svelte';
    import EmailForm from '$lib/forms/EmailChangeForm.svelte';
    import EmailVerification from '$lib/forms/EmailVerificationForm.svelte'
	import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
	import Header from '$lib/Header.svelte';
	import { BadgeCheck, User, } from 'lucide-svelte';
	import LeaseCustomer from '$lib/displayComponents/customerViews/LeaseCustomer.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import { fade } from 'svelte/transition';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import PaymentRecordCustomer from '$lib/displayComponents/customerViews/PaymentRecordCustomer.svelte';
	import ThemeSelector from '$lib/displayComponents/ThemeSelector.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
    
    let {data}:{ data: PageData} = $props();
    let addressModalOpen = $state(false);
    let nameModalOpen = $state(false);
    let emailModalOpen = $state(false);
    let emailVerification = $state(false);
    let emailVerificationModalOpen = $state(false);
    let leaseEndModalOpen = $state(false);
    let currentLeaseId = $state('');
    function setCurrentLeaseId(leaseId:string){
        currentLeaseId = leaseId;
        leaseEndModalOpen = true;
    }
</script>
<Header title='Settings for {data.user?.givenName}' />

<div transition:fade={{duration:600}} class="mx-2 mt-9">
    <div class="flex flex-row gap-3">
        <div>
            {#if data.user}
                <UserCustomer user={data.user}/>
            {/if}
            {#if data.user?.emailVerified}
                <BadgeCheck size='20' />
            {:else}
                <button class="btn preset-filled-primary-50-950 text-wrap h-20 sm:h-8" onclick={()=>emailVerificationModalOpen=true}>Please confirm your email address</button>
                <Modal
                    bind:open={emailVerificationModalOpen}
                    contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
                    backdropClasses="backdrop-blur-sm"
                >
                    {#snippet content()}
                        <EmailVerification data={data.emailVerificationForm} bind:emailVerificationModalOpen={emailVerificationModalOpen} redirect='false' bind:emailVerification={emailVerification}/>
                        <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>emailVerificationModalOpen = false}>Cancel</button>
                    {/snippet}
                </Modal>
            {/if}
        </div>
        <div class="flex flex-col sm:flex-row gap-2 m-2">
            <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>nameModalOpen=true}>Change Name</button>
            <button class="btn preset-filled-primary-50-950 rounded-lg " onclick={()=>emailModalOpen=true}>Change Email</button>
        </div>
    </div>
    <Modal
        bind:open={nameModalOpen}
        contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
        backdropClasses="backdrop-blur-sm"
    >
        {#snippet content()}
            <NameForm data={data.nameForm} bind:nameModalOpen={nameModalOpen} />
            <button class="btn" onclick={()=>nameModalOpen=false}>Cancel</button>
        {/snippet}
    </Modal>

    <Modal
        bind:open={emailModalOpen}
        contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
        backdropClasses="backdrop-blur-sm"
    >
        {#snippet content()}
            <EmailForm data={data.emailForm} bind:emailModalOpen={emailModalOpen} bind:emailVerification={emailVerification} />
            <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>emailModalOpen = false}>Cancel</button>
        {/snippet}
    </Modal>
    <div class="flex flex-col sm:flex-row gap-3">
        {#await data.addressPromise}
            ...loading address
        {:then address} 
        {#if address}
            <AddressCustomer {address} classes='pt-2'/>
        {/if}
            <Modal
                bind:open={addressModalOpen}
                triggerBase="btn preset-filled-primary-50-950 rounded-lg"
                contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
                backdropClasses="backdrop-blur-sm"
            >
                {#snippet trigger()}
                    {#if address}
                        Change Address
                    {:else}
                        Add address
                    {/if}
                {/snippet}
                {#snippet content()}
                    <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.user?.id!}/>
                    <button class="btn" onclick={()=>addressModalOpen=false}>Close</button>
                {/snippet}
            </Modal>
        {/await}
    </div>

    {#await data.leasesPromise}
        ...loading leases
    {:then leases}
        {#if leases}
        <Modal 
            bind:open={leaseEndModalOpen}
            contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
            backdropClasses="backdrop-blur-sm"
        >
            {#snippet content()}
                <LeaseEndForm data={data.leaseEndForm} bind:leaseEndModalOpen={leaseEndModalOpen} leaseId={currentLeaseId} customer={data.user?.employee}/>
                <button class="btn preset-filled-primary-50-950 rounded-lg" onclick={()=>leaseEndModalOpen=false}>Cancel</button>
            {/snippet}
        </Modal>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {#each leases as lease}
                <div>
                    <LeaseCustomer lease={lease} classes='w-64'/>
                    {#if !lease.leaseEnded}
                        <button class="btn preset-filled-primary-50-950 rounded-lg m-2" onclick={()=> setCurrentLeaseId(lease.leaseId)}>End Lease</button>
                        {#if !lease.stripeSubscriptionId}
                            <a class="btn preset-filled-primary-50-950 rounded-lg m-2" href="/autopay?leaseId={lease.leaseId}">Sign Up for Autopay</a>
                        {:else}
                            Thanks for auto-paying!
                        {/if}
                    {/if}
                </div>
            {/each}
        </div>
        {/if}
    {/await}
    <div class="grid grid-cols-1 gap-x-1 gap-y-3 py-2 mt-10">
        {#await data.invoicesPromise}
            loading invoices
        {:then invoices} 
            {#await data.paymentsPromise}
                loading payments
            {:then payments} 
                <div class="sm:grid sm:grid-cols-2 gap-x-1 gap-y-3">
                    {#each invoices as invoice}
                    {@const paymentRecord = payments.find((payment) => payment.invoiceNum === invoice.invoiceNum)}
                        <InvoiceCustomer {invoice} classes="border border-primary-50 dark:border-primary-950 rounded-lg"/>
                        {#if paymentRecord}
                            <PaymentRecordCustomer {paymentRecord} classes="border border-primary-50 dark:border-primary-950 rounded-lg"/>
                        {/if}
                    {/each}
                </div>
            {/await}
        {/await}
    </div>
</div>

<ThemeSelector />