<script lang="ts">
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
   import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import { superForm } from 'sveltekit-superforms';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
   import AddressForm from '$lib/forms/AddressForm.svelte';
   import { fade, crossfade, blur } from 'svelte/transition';
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
   import FormMessage from '$lib/formComponents/FormMessage.svelte';
   import Checkbox from '$lib/formComponents/Checkbox.svelte';
   import LeaseDiscountForm from '$lib/forms/LeaseDiscountForm.svelte';
   import RadioButton from '$lib/formComponents/RadioButton.svelte';

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
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
</script>


<Header title="Employee New Lease" />
<div transition:fade={{duration:600}} class="mx-2 mt-10">
   {#if !data.customer}
      <div class="m-2">
         <a href="/employeeNewCustomer" class="btn rounded-lg preset-filled-primary-50-950">Create new customer</a>
         Renting unit {data.unitNum.replace(/^0/gm,'').replace(/x0/gm, 'x')}
         <form action="/employeeNewLease?/selectCustomer&unitNum={data.unitNum}" method="POST" >
            <Combobox
            data={customerComboBoxData}
            bind:value={selectedCustomer}
            label='Select a customer'
            placeholder='Select...'
            positionerZIndex='z-10'
            openOnClick={true}
            onValueChange={(details) => {
               selectedCustomer = details.value
            }}
            />
            <input type="hidden" name="customerId" value={selectedCustomer}>
            <button class="btn preset-filled-primary-50-950 rounded-lg mt-2">Choose Customer</button>    
         </form>
      </div>
   {:else}
      <FormMessage message={$message} />
      <form method="POST" action="/employeeNewLease?/newLease" use:enhance>
         {#if data.customer}
            <UserEmployee user={data.customer} />
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
            contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
            backdropClasses="backdrop-blur-xs"
         >
         {#snippet trigger()}
            Add address
         {/snippet}
         {#snippet content()}
            <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.customer?.id}/>
            <button class="btn " onclick={()=>addressModalOpen=false}>Close</button>
         {/snippet}
      </Modal>
      {/if}
      {#if data.unit}
         <UnitEmployee unit={data.unit} classes="w-80" />
         <input type="hidden" name="unitNum" value={data.unit.num} />
         {#if data.discount}
            <input type='hidden' name='discountId' value={data.discount.discountId} />
            {#if data.discount.percentage}
               <div transition:fade={{duration:300}} class="grid grid-cols-2 w-80 gap-x-2">
                  <div class="text-right">Discount</div><div class="text-green-700 dark:text-green-500">{data.discount.amountOff}%</div>
                  <div class="text-right">Monthly Rent</div><div class="text-green-700 dark:text-green-500">{currencyFormatter.format(data.unit.advertisedPrice - (data.unit.advertisedPrice * (data.discount.amountOff / 100)))}</div>
               </div>
            {:else}
               <div class="" transition:fade={{duration:300}}>
                  Discount ${data.discount.amountOff}
                  Monthly Rent: ${data.unit.advertisedPrice! - data.discount.amountOff}
               </div>
            {/if}
         {/if}
      {/if}
         <div class="flex flex-col w-80">
            {#if data.unit && data.address}
            <div class="flex bg-primary-50 dark:bg-primary-950 mt-2 rounded-lg">
               <RadioButton
                  value='STRIPE'
                  errors={$errors.paymentType}
                  constraints={$constraints.paymentType}
                  groupName='paymentType'
                  id='STRIPE'
                  label="Stripe"
               />
               <RadioButton
                  value='CASH'
                  errors={$errors.paymentType}
                  constraints={$constraints.paymentType}
                  groupName='paymentType'
                  id='CASH'
                  label='Cash'
               />
               <RadioButton
                  value='CHECK'
                  errors={$errors.paymentType}
                  constraints={$constraints.paymentType}
                  groupName="paymentType"
                  id='CHECK'
                  label='Check'
               />
            </div>
            <FormSubmitWithProgress 
               delayed={$delayed} 
               timeout={$timeout} 
               buttonText='The above is correct charge ${data.unit.deposit} deposit'
               classes=''  
            />
            {/if}
            </div>
      </form>
      {#if !data.discount}
         <div transition:fade={{duration:600}}>
               <LeaseDiscountForm 
               data={data.leaseDiscountForm} 
               unitNum={data.unit?.num} 
               customerId={data.customer.id} 
               classes='w-80'
               />
         </div>
      {/if}
   {/if}
</div>