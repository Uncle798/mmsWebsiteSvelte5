<script lang="ts">
    import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
    import AddressForm from '../../lib/forms/AddressForm.svelte'
    import { Modal, } from '@skeletonlabs/skeleton-svelte';
    import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
    import { superForm } from 'sveltekit-superforms';
    import { onMount, getContext } from 'svelte';
    import type { ToastContext } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
	import UnitCustomer from '$lib/displayComponents/customerViews/UnitCustomer.svelte';
	import Checkbox from '$lib/formComponents/Checkbox.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import Header from '$lib/Header.svelte';
	import LeaseDiscountForm from '$lib/forms/LeaseDiscountForm.svelte';
	import { fade, } from 'svelte/transition';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
    
    let { data }: {data:PageData} = $props();
    let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data.leaseForm);
    let addressModalOpen = $state(false);
    export const toast:ToastContext = getContext('toast');
    const toastReason = data.redirectTo
    onMount(()=> {
        if(toastReason === 'newLease'){
            toast.create({
                title: 'Thanks for logging in',
                description: 'We appreciate your business',
                type:'success'
            })

        }
    })
    const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
</script>
<Header title='New lease'/>
<div in:fade={{duration:600}} class="mx-2 mt-12 sm:mt10">
    {#if data.user}
        <UserCustomer user={data.user} />
    {/if}
    <FormMessage message={$message} />
    <form method="post" use:enhance>
        <input type='hidden' name=customerId value={data.user?.id} />
        {#if data.user?.organizationName}
            <Checkbox
                bind:value={$form.organization}
                errors={$errors.organization}
                constraints={$constraints.organization}
                name='organization'
                label='This unit is being rented by an organization'
            />
        {/if}
        {#if data.address}
            <AddressCustomer address={data.address} />
        {:else}
            <Modal
                bind:open={addressModalOpen}
                triggerBase="btn rounded-lg preset-filled-primary-50-950 my-2"
                contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
                backdropClasses="backdrop-blur-xs"
            >
            {#snippet trigger()}
                Add address
            {/snippet}
            {#snippet content()}
                <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.user?.id}/>
                <button class="btn" onclick={()=>addressModalOpen=false}>Close</button>
            {/snippet}
        </Modal>
        {/if}
        {#if data.unit}
            <UnitCustomer unit={data.unit} classes='py-2 w-64'/>
            <input type="hidden" name="unitNum" value={data.unit.num}>
            {#if data.discount}
                <input type="hidden" name="discountId" value={data.discount.discountId}>
                <div class="py-2" in:fade={{duration:300}}>
                    {#if data.discount.percentage}
                        Discount: <span class="text-green-700 dark:text-green-500">{data.discount.amountOff}%</span>
                        Monthly Rent: <span class="text-green-700 dark:text-green-500">{currencyFormatter.format(data.unit.advertisedPrice - (data.unit.advertisedPrice * (data.discount.amountOff / 100)))}</span>
                    {:else}
                        Discount: <span class="text-green-700 dark:text-green-500">{currencyFormatter.format(data.discount.amountOff)}</span>
                        Monthly Rent: <span class="text-green-700 dark:text-green-500">{currencyFormatter.format(data.unit.advertisedPrice - data.discount.amountOff)}</span>
                    {/if}
                </div>
            {/if}
        {/if}
        <div class="flex">
            {#if data.unit && data.address}
                <FormProgress delayed={$delayed} timeout={$timeout} buttonText='The above is correct I would like to pay my deposit'/>
            {/if}
        </div>
    </form>
    {#if !data.discount}
        <div in:fade={{duration:600}} out:fade={{duration:0}}>
            <LeaseDiscountForm data={data.leaseDiscountForm} unitNum={data.unitNum} classes='w-72'/>
        </div>
    {/if}
</div>