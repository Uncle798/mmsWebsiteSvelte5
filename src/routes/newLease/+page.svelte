<script lang="ts">
    import Address from '$lib/displayComponents/Address.svelte';
    import AddressForm from '../../lib/forms/AddressForm.svelte'
    import { Modal, } from '@skeletonlabs/skeleton-svelte';
    import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
    import { superForm } from 'sveltekit-superforms';
    import { onMount, getContext } from 'svelte';
    import type { ToastContext } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
	import UnitCustomer from '$lib/displayComponents/UnitCustomer.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Checkbox from '$lib/formComponents/Checkbox.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import Header from '$lib/Header.svelte';
	import LeaseDiscountForm from '$lib/forms/LeaseDiscountForm.svelte';
	import { blur, crossfade, fade } from 'svelte/transition';
    
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
</script>
<Header title='New lease'/>
<div transition:blur={{duration:600}}>


{#if data.user}
    <User user={data.user} />
{/if}
<FormMessage message={$message} />
<form method="post" use:enhance>
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
        <Address address={data.address} />
    {:else}
        <Modal
            bind:open={addressModalOpen}
            triggerBase="btn preset-tonal"
            contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
            backdropClasses="backdrop-blur-sm"
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
        <UnitCustomer unit={data.unit} />
        <input type="hidden" name="unitNum" value={data.unit.num}>
        {#if data.discount}
            <div class="card p-4" transition:fade={{duration:300}}>
                Discount ${data.discount.amountOff}
                Monthly Rent: ${data.unit.advertisedPrice! - data.discount.amountOff}
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
    <div transition:fade={{duration:600}}>
        <LeaseDiscountForm data={data.leaseDiscountForm} unitNum={data.unitNum} />
    </div>
{/if}
</div>