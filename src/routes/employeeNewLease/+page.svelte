<script lang="ts">
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
   import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import { superForm } from 'sveltekit-superforms';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
   import AddressForm from '$lib/forms/AddressForm.svelte';
   import { fade, } from 'svelte/transition';
   import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
   import FormMessage from '$lib/formComponents/FormMessage.svelte';
   import Checkbox from '$lib/formComponents/Checkbox.svelte';
   import LeaseDiscountForm from '$lib/forms/LeaseDiscountForm.svelte';
   import RadioButton from '$lib/formComponents/RadioButton.svelte';
	import { PaymentType } from '@prisma/client';
	import { onMount } from 'svelte';
	import RegisterForm from '$lib/forms/RegisterForm.svelte';
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';

   let { data }: { data: PageData } = $props();
   let addressModalOpen = $state(false);
   let registerModalOpen = $state(false);
   let emailVerificationModalOpen = $state(false);
   let userId = $state('')
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data.leaseForm, {

   });
   let selectedCustomer = $state([''])
   interface ComboBoxData{
      label: string;
      value: string;
   }
   const customerComboBoxData:ComboBoxData[]=[];
   onMount(() => {
      console.log(data.customers)
      data.customers.forEach((customer) =>{
         const label = `${customer.givenName} ${customer.familyName} (${customer.email})`;
         const value = customer.id;
         const datum = {
            label,
            value
         }
         customerComboBoxData.push(datum);
      });
      if(data.customer){
         if(!data.customer.emailVerified){
            emailVerificationModalOpen=true
         }
      }
   })
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
</script>


<Header title="Employee New Lease" />

<Modal
   open={registerModalOpen}
   onOpenChange={(e)=> registerModalOpen = e.open}
   triggerBase="btn preset-filled-primary-50-950"
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
   backdropClasses="backdrop-blur-xs"
>
   {#snippet content()}
      <RegisterForm 
         data={data.registerForm} 
         formType='employee' 
         bind:registerFormModalOpen={registerModalOpen} 
         bind:emailVerificationModalOpen={emailVerificationModalOpen} 
         redirectTo='false' 
         unitNum={data.unitNum}
         bind:userId={userId}
      />
      <button class="btn preset-filled-primary-50-950" onclick={()=>registerModalOpen=false}>Close</button>
   {/snippet}
</Modal>
{#if (data.customer && !data.customer.emailVerified) || userId !=='' }
   <Modal
      open={emailVerificationModalOpen}
      onOpenChange={(e)=> emailVerificationModalOpen = e.open}
      triggerBase="btn preset-filled-primary-50-950"
      contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
      backdropClasses="backdrop-blur-xs"
   >
      {#snippet content()}
         <EmailVerificationForm 
            data={data.emailVerificationForm} 
            bind:emailVerificationModalOpen={emailVerificationModalOpen} 
            userId={userId ? userId : data.customer!.id}
            redirect='' 
         />
         <button class="btn preset-filled-primary-50-950" onclick={()=>emailVerificationModalOpen=false}>Close</button>
      {/snippet}
   </Modal>
{/if}
<div in:fade={{duration:600}} out:fade={{duration:0}} class="mx-2 mt-14 sm:mt-12">
   {#if !data.customer}
      <div class="m-2">
         <button class="btn rounded-lg preset-filled-primary-50-950" onclick={()=>registerModalOpen=true}>Create new customer</button>
         <h1 class="m-1 h4">
            Renting unit {data.unitNum.replace(/^0+/gm,'').replace(/x0/gm, 'x')}
         </h1>
         <form action="/employeeNewLease?/selectCustomer&unitNum={data.unitNum}" method="POST" >
            <Combobox
               data={customerComboBoxData}
               value={selectedCustomer}
               label='Select a customer'
               placeholder='Select...'
               openOnClick={true}
               onValueChange={(details) => {
                  selectedCustomer = details.value
               }}
               optionClasses='truncate'
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
         <Modal
            open={addressModalOpen}
            onOpenChange={(e)=> addressModalOpen = e.open}
            triggerBase="btn preset-filled-primary-50-950"
            contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
            backdropClasses="backdrop-blur-xs"
         >
         {#snippet content()}
            <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.customer?.id}/>
            <button class="btn preset-filled-primary-50-950" onclick={()=>addressModalOpen=false}>Close</button>
         {/snippet}
      </Modal>
      {#if data.address}
         <Address address={data.address} />
         <button class="btn preset-filled-primary-50-950" onclick={()=> addressModalOpen=true} type='button'>Edit Address</button>
      {:else}
         <button class="btn preset-filled-primary-50-950" onclick={()=> addressModalOpen=true} type='button'>Add Address</button>   
      {/if}
      {#if data.unit}
         <UnitEmployee unit={data.unit} classes="w-80" />
         <input type="hidden" name="unitNum" value={data.unit.num} />
         {#if data.discount}
            <input type='hidden' name='discountId' value={data.discount.discountId} />
            {#if data.discount.percentage}
               <div in:fade={{duration:600}} class="grid grid-cols-2 w-80 gap-x-2">
                  <div class="text-right">Discount</div><div class="text-green-700 dark:text-green-500">{data.discount.amountOff}%</div>
                  <div class="text-right">Monthly Rent</div><div class="text-green-700 dark:text-green-500">{currencyFormatter.format(data.unit.advertisedPrice - (data.unit.advertisedPrice * (data.discount.amountOff / 100)))}</div>
               </div>
            {:else}
               <div class="grid grid-cols-2 w-80 gap-x-2" in:fade={{duration:300}}>
                  <div>Discount</div> <div class="text-green-700 dark:text-green-500"> ${data.discount.amountOff}</div>
                  <div>Monthly Rent:</div> <div class="text-green-700 dark:text-green-500"> ${data.unit.advertisedPrice! - data.discount.amountOff}</div>
               </div>
            {/if}
         {/if}
      {/if}
         <div class="flex flex-col w-80">
            {#if data.unit && data.address}
               <div class="flex bg-primary-50-950 mt-2 rounded-lg justify-between">
                  {#each Object.values(PaymentType) as paymentType}
                     <RadioButton
                        value={paymentType}
                        errors={$errors.paymentType}
                        constraints={$constraints.paymentType}
                        groupName='paymentType'
                        id={paymentType}
                        label={paymentType.substring(0,1) + paymentType.substring(1).toLowerCase()}
                     />
                  {/each}
               </div>
               <FormSubmitWithProgress 
                  delayed={$delayed} 
                  timeout={$timeout} 
                  buttonText='The above is correct charge ${data.unit.deposit} deposit'
                  classes=''  
               />
            {:else if data.unit}
               Please add address.
            {:else}
               Please select unit.
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