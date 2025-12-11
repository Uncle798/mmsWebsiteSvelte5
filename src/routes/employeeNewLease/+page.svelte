<script lang="ts">
   import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
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
	import RegisterForm from '$lib/forms/RegisterForm.svelte';
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';
   import Combobox from '$lib/formComponents/Combobox.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
   import { PaymentType } from '../../generated/prisma/enums';
	import Button from '$lib/core/Button.svelte';
	import NumberInput from '$lib/formComponents/NumberInput.svelte';

   let { data }: { data: PageData } = $props();
   let modalOpen = $state(false);
   let userId = $state('');
   let { form, errors, message, constraints, enhance, delayed, timeout, } = superForm(data.leaseForm, {

   });
   let selectedCustomer = $state([''])
   interface ComboBoxData{
      label: string;
      value: string;
   }
   const customerComboBoxData:ComboBoxData[] = $derived(data.customers.map(customer => ({
      label: `${customer.givenName} ${customer.familyName} (${customer.email})`,
      value: customer.id
   })));
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
   const paymentTypes = Object.values(PaymentType);
   let customerSelectForm:HTMLFormElement | undefined = $state();
   let customerSelectSubmit:HTMLButtonElement | undefined = $state();
   let customerCuidId:HTMLInputElement | undefined = $state();
   let modalReason = $state('');
</script>

<Header title="Employee New Lease" />

<FormModal
   bind:modalOpen={modalOpen}
>
   {#snippet content()}
      {#if modalReason === 'registerForm'}         
         <RegisterForm 
            data={data.registerForm} 
            formType='employee' 
            bind:registerFormModalOpen={modalOpen}
            redirectTo='employeeNewLease' 
            unitNum={data.unitNum}
         />
      {:else if modalReason === 'emailVerification'}
         <EmailVerificationForm 
            data={data.emailVerificationForm} 
            bind:emailVerificationModalOpen={modalOpen} 
            userId={userId ? userId : data.customer!.id}
            redirect='' 
         />
      {:else if modalReason === 'address'}
         <AddressForm data={data.addressForm} bind:addressModalOpen={modalOpen} userId={data.customer?.id} />
      {/if}
   {/snippet}
</FormModal>
<div in:fade={{duration:600}} out:fade={{duration:0}} class="mx-2 mt-14 sm:mt-12">
   {#if !data.customer}
      <div class="m-2">
         <Button
            label='Create new customer'
            type='button'
            onClick={() => {
               modalReason='registerForm'
               modalOpen=true;
            }}
         />
         {#if data.unit}
            <UnitEmployee unit={data.unit} />
         {/if}
         <form action="/employeeNewLease?/selectCustomer&unitNum={data.unitNum}" method="POST" use:enhance bind:this={customerSelectForm} >
            <Combobox
               data={customerComboBoxData}
               label='Select a customer'
               placeholder='Type or select...'
               onValueChange={(details) => {
                  selectedCustomer = details.value;
                  if(customerCuidId){
                     customerCuidId.value=details.value[0].toString()
                  }
                  if(customerSelectForm){
                     customerSelectForm.requestSubmit(customerSelectSubmit)
                  }
               }}
            />
            <input type="hidden" name="cuidId" value={selectedCustomer[0]} bind:this={customerCuidId}>
            <button class="hidden" bind:this={customerSelectSubmit}>Choose Customer</button>    
         </form>
      </div>
   {:else}
      <FormMessage message={$message} />
      <form method="POST" action="/employeeNewLease?/newLease" use:enhance>
         {#if data.customer}
            <UserEmployee user={data.customer} />
            {#if !data.customer.emailVerified}               
               <Button
                  label='Verify email address'
                  type='button'
                  onClick={() => {
                     modalReason='emailVerify';
                     modalOpen=true;
                  }}
               />
            {/if}
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
         <Button
            label='Add address'
            type='button'
            onClick={() => {
               modalReason = 'address';
               modalOpen = true;
            }}
         /> 
      {:else}
         <Button
            label='Add address'
            type='button'
            onClick={() => {
               modalReason = 'address';
               modalOpen = true;
            }}
         /> 
      {/if}
      {#if data.unit}
         <UnitEmployee unit={data.unit} classes="" />
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
         <div class="flex flex-col ">
            {#if data.unit && data.address}
            <NumberInput
               bind:value={$form.depositAmount}
               errors={$errors.depositAmount}
               constraints={$constraints.depositAmount}
               label='Deposit amount $'
               name='depositAmount'
               {@attach () => {
                  $form.depositAmount = data.unit!.deposit;
               }}
            />
               <div class="flex bg-primary-50-950 mt-2 p-2 rounded-lg justify-between">
                  {#each paymentTypes as paymentType}
                     {#if paymentType === 'CREDIT'}                        
                        <RadioButton
                           value={paymentType}
                           errors={$errors.paymentType}
                           constraints={$constraints.paymentType}
                           groupName='paymentType'
                           id={paymentType}
                           label={paymentType.substring(0,1) + paymentType.substring(1).toLowerCase()}
                           disabled={true}
                        />
                     {:else}
                        <RadioButton
                           value={paymentType}
                           errors={$errors.paymentType}
                           constraints={$constraints.paymentType}
                           groupName='paymentType'
                           id={paymentType}
                           label={paymentType.substring(0,1) + paymentType.substring(1).toLowerCase().replace(/_/gm, ' ')}
                        />
                     {/if}
                  {/each}
               </div>
               <FormSubmitWithProgress 
                  delayed={$delayed} 
                  timeout={$timeout} 
                  buttonText='The above is correct charge ${$form.depositAmount} deposit'
                  classes=''  
               />
            {:else if data.unit}
               <div class="font-bold text-2xl">Please add address.</div>
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
               classes='w-80 discountForm'
            />
         </div>
      {/if}
   {/if}
</div>