<script lang="ts">
  import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
  import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
  import { superForm } from 'sveltekit-superforms';
  import User from '$lib/displayComponents/User.svelte';
  import Address from '$lib/displayComponents/Address.svelte';
  import AddressForm from '$lib/forms/AddressForm.svelte';
  import { fade, crossfade, blur } from 'svelte/transition';
  import Header from '$lib/Header.svelte';
  import type { PageData } from './$types';
	import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
  import Checkbox from '$lib/formComponents/Checkbox.svelte';
  import LeaseDiscountForm from '$lib/forms/LeaseDiscountForm.svelte';
	import { unitNotesFormSchema } from '$lib/formSchemas/schemas';
  let { data }: { data: PageData } = $props();
  let addressModalOpen = $state(false)
  let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data.leaseForm, {

  });
  let selectedCustomer = $state([''])
  interface ComboBoxData{
    label: string;
    value: string;
  }
  const customerComboBoxData:ComboBoxData[]=[];
  data.customers.forEach((customer) =>{
    const label = `${customer.givenName} ${customer.familyName}`;
      const value = customer.id;
      const datum = {
         label,
         value
      }
      customerComboBoxData.push(datum);
  })
</script>


<Header title="Employee New Lease" />
<div transition:fade={{duration:600}}>
{#if !data.customer}
  <div class="mx-4">
    <p><a href="/employeeNewCustomer">Create new customer</a></p>
    <form action="/employeeNewLease?/selectCustomer&unitNum={data.unitNum}" method="POST" >
      <Combobox
        data={customerComboBoxData}
        bind:value={selectedCustomer}
        label='Select a customer'
        placeholder='Select...'
        openOnClick={true}
        onValueChange={(details) => {
          selectedCustomer = details.value
        }}
        classes='z-10'
      />
      <input type="hidden" name="customerId" value={selectedCustomer}>
      <button class="btn z-0">Choose Customer</button>    
    </form>
  </div>
{:else}
<FormMessage message={$message} />
<form method="POST" action="/employeeNewLease?/newLease" use:enhance>
  {#if data.customer}
    <User user={data.customer} />
    <input type="hidden" value={data.customer.id} name='customerId'/>
  {/if}
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
        <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.customer?.id}/>
        <button class="btn mx-4" onclick={()=>addressModalOpen=false}>Close</button>
    {/snippet}
  </Modal>
  {/if}
{#if data.unit}
        <UnitEmployee unit={data.unit} />
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
        <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='The above is correct charge ${data.unit.deposit} deposit'/>
        {/if}
    </div>
  </form>
  {#if !data.discount}
    <div transition:fade={{duration:600}}>
        <LeaseDiscountForm data={data.leaseDiscountForm} unitNum={data.unit?.num} />
    </div>
  {/if}
  {/if}
</div>