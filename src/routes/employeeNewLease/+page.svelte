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
	import { onMount } from 'svelte';
	import RegisterForm from '$lib/forms/RegisterForm.svelte';
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';
   import ExplainerModal from '$lib/demo/ExplainerModal.svelte';

   let { data }: { data: PageData } = $props();
   let addressModalOpen = $state(false);
   let registerModalOpen = $state(false);
   let userId = $state('')
   let { form, errors, message, constraints, enhance, delayed, timeout, } = superForm(data.leaseForm, {

   });
   let selectedCustomer = $state([''])
   interface ComboBoxData{
      label: string;
      value: string;
   }
   const customerComboBoxData:ComboBoxData[]=[];
   onMount(() => {
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
            registerModalOpen=true
         }
      }
   })
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
   const paymentTypes = [ 'CASH', 'CHECK', 'CREDIT'];
   let paymentExplainerModalOpen = $state(false);
   let newCustomerExplainerModalOpen = $state(false);
   let customerSelectForm:HTMLFormElement | undefined = $state();
   let customerSelectSubmit:HTMLButtonElement | undefined = $state();
   let customerCuidId:HTMLInputElement | undefined = $state();
</script>

<Header title="Employee New Lease" />

<Modal
   open={registerModalOpen}
   onOpenChange={(e)=> registerModalOpen = e.open}
   triggerBase="btn preset-filled-primary-50-950"
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm) sm:min-w-lg"
   backdropClasses="backdrop-blur-xs"
>
   {#snippet content()}
   {#if !data.customer}
      <RegisterForm 
         data={data.registerForm} 
         formType='employee' 
         bind:registerFormModalOpen={registerModalOpen}
         redirectTo='employeeNewLease' 
         unitNum={data.unitNum}
      />
      <button class="btn preset-filled-primary-50-950" onclick={()=>registerModalOpen=false}>Close</button>
      {:else if !data.customer.emailVerified && data.customer} 
         <EmailVerificationForm 
            data={data.emailVerificationForm} 
            bind:emailVerificationModalOpen={registerModalOpen} 
            userId={userId ? userId : data.customer!.id}
            redirect='' 
         />
         <button class="btn preset-filled-primary-50-950" onclick={()=>registerModalOpen=false}>Close</button>
      {:else}
         <div {@attach ()=> {registerModalOpen=false}}></div>
      {/if}
   {/snippet}
</Modal>
<ExplainerModal
   bind:modalOpen={paymentExplainerModalOpen}
>
   {#snippet copy()}
      Please select cash or check to complete the project as there is currently no way to demo a credit payment.
   {/snippet}
</ExplainerModal>
<ExplainerModal
   bind:modalOpen={newCustomerExplainerModalOpen}
>
   {#snippet copy()}
      To create a new customer you'll need an email address that isn't the one you registered for the demo with. If you use gmail you can add a period (.) in the name and it will work as a new email address. 
      i.e. firstNameLastName@gmail.com and firstName.LastName@gmail.com will both be received in the same inbox but do work as separate email addresses in the database.
   {/snippet}
</ExplainerModal>


<div in:fade={{duration:600}} out:fade={{duration:0}} class="mx-2 mt-14 sm:mt-12">
   {#if !data.customer}
      <div class="m-2">
         <button class="btn rounded-lg preset-filled-primary-50-950" onclick={()=>registerModalOpen=true} {@attach ()=>{ 
            newCustomerExplainerModalOpen = true;
            setTimeout(()=>{
               newCustomerExplainerModalOpen = false;
            }, 15000);
         }}>Create new customer</button>
         {#if data.unit}
            <UnitEmployee unit={data.unit} />
         {/if}
         <form action="/employeeNewLease?/selectCustomer&unitNum={data.unitNum}" method="POST" use:enhance bind:this={customerSelectForm} >
            <Combobox
               data={customerComboBoxData}
               value={selectedCustomer}
               label='Select a customer'
               placeholder='Type or select...'
               onValueChange={(details) => {
                  selectedCustomer = details.value;
                  console.log()
                  if(customerCuidId){
                     customerCuidId.value=details.value[0].toString()
                  }
                  if(customerSelectForm){
                     customerSelectForm.requestSubmit(customerSelectSubmit)
                  }
               }}
               optionClasses='truncate'
               openOnClick={true}
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
               <div class="flex bg-primary-50-950 mt-2 p-2 rounded-lg justify-between" {@attach ()=>{
                  paymentExplainerModalOpen=true;
                  setTimeout(()=>{
                     paymentExplainerModalOpen = false
                  }, 4000);
               }}>
                  {#each paymentTypes as paymentType}
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
               <div class="font-bold">Please add address.</div>
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