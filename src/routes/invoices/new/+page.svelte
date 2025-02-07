<script lang="ts">
    import NewInvoiceForm from '$lib/forms/NewInvoiceForm.svelte';
	import RegisterForm from '$lib/forms/RegisterForm.svelte';
	import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import { blur, fade } from 'svelte/transition';

    let { data }: { data: PageData } = $props();
    let registerFormModalOpen = $state(false);
</script>


<Modal
   bind:open={registerFormModalOpen}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-screen-sm"
   backdropClasses="backdrop-blur-sm"
>
    {#snippet content()}
        <RegisterForm data={data.registerForm} registerFormModalOpen={registerFormModalOpen} formType='employee'/>
        <button class="btn" onclick={()=>registerFormModalOpen=false}>Cancel</button>
    {/snippet}
</Modal>
<Header title="New Invoice" />
<div transition:fade={{duration:600}}>
    <button class="btn preset-filled-primary-50-950 rounded-lg m-2" type="button" onclick={()=>registerFormModalOpen = true}>Create New Customer</button>
    <NewInvoiceForm data={data.newInvoiceForm} employeeId={data.user?.id} customers={data.customers} leases={data.leases} classes='px-2'/>
</div>