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
	import { onMount } from 'svelte';
	import RegisterForm from '$lib/forms/RegisterForm.svelte';
	import EmailVerificationForm from '$lib/forms/EmailVerificationForm.svelte';
   import Combobox from '$lib/formComponents/Combobox.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
   import { driver } from 'driver.js';
   import 'driver.js/dist/driver.css';

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
   const customerComboBoxData:ComboBoxData[] = $derived(data.customers.map(customer => ({
      label: `${customer.givenName} ${customer.familyName} (${customer.email})`,
      value: customer.id
   })));
   const userEmailAddress = data.user?.email?.toLowerCase();
   const userEmailName = userEmailAddress?.substring(0, userEmailAddress.indexOf('@')).toLowerCase();
   const userEmailDomain = userEmailAddress?.substring(userEmailAddress.indexOf('@')+1).toLowerCase();
   let gmailName = () => {
      if(data.user?.givenName && data.user.familyName){
         const givenName = data.user.givenName.toLowerCase();
         const familyName = data.user.familyName.toLowerCase();
         if(userEmailName?.includes('.')){
            return userEmailName.substring(0, userEmailName.indexOf('.')) + userEmailName.substring(userEmailName.indexOf('.')+1);
         }else if(userEmailName?.includes(givenName)){
            return userEmailName.substring(userEmailName.indexOf(givenName, givenName.length)) + '.' + userEmailName.substring(userEmailName.indexOf(givenName) + givenName.length + 1)
         }else if(userEmailName?.includes(familyName)){
            return userEmailName.substring(userEmailName.indexOf(familyName, familyName.length)) + '.' + userEmailName.substring(userEmailName.indexOf(familyName) + familyName.length + 1)
         } else {
            return userEmailName?.substring(0, 2) + '.' + userEmailName?.substring(2);
         }
      }
      return undefined
   }
   const tour = driver({
      showProgress: true,
      steps: [
         { popover: { title: 'New Lease', description: `Here's where you would create a lease in person or over the phone. It looks exactly like the customer version except for taking in person forms of payment.`}},
         {element: '.createCustomerButton', popover: {title: 'Create a customer', 
            description: `Create a new customer here. You'll need to use a different email address than the one you registered for the demo with.\
            If you use gmail you can add a period (.) in the name and it will work as a new email address. i.e. ${userEmailAddress} and ${gmailName() + '@' + userEmailDomain}\
            will be received in the same inbox but are different in the database.
         `}},
      ],
      onDestroyed: () => {
         fetch('/api/demoSetCookie?demoPage=employeeNewLease');
      }
   })
   onMount(() => {
      if(data.customer){
         if(!data.customer.emailVerified){
            registerModalOpen=true
         }
      }
      console.log(data.demoCookie)
      if(data.demoCookie !== 'true'){  
         tour.drive();
      }
   })
   const currencyFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
   const paymentTypes = [ 'CASH', 'CHECK', 'CREDIT'];
   let customerSelectForm:HTMLFormElement | undefined = $state();
   let customerSelectSubmit:HTMLButtonElement | undefined = $state();
   let customerCuidId:HTMLInputElement | undefined = $state();
   function addressButtonTour () {
      const addressButtonTour = driver({
         showProgress: true,
         steps: [
            { element: '.addAddressButton', popover: { title: 'Add an address', description: `You'll need to add an address, Feel free to use
            1700 Mill Rd Moscow ID 83843. All of this info will be destroyed when you leave the demo.` } },
            { element: '.discountForm', popover: { title:"Discounts", description: `MMS has discounts so you can offer specials or give non-profits or veterans a deal.` } }
         ]
      })
      addressButtonTour.drive();
   }
   function paymentMethodTour () {
      const paymentMethodTour = driver({
         showProgress: true,
         stagePadding: 2,
         steps: [
            {element: '.paymentTypes', popover: { title: `Payment Types`, description: `Currently there is no way to demo credit payments. Please choose cash or check to pay the deposit.`}}
         ]
      });
      paymentMethodTour.drive();
   }
</script>

<Header title="Employee New Lease" />

<FormModal
   modalOpen={registerModalOpen}
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
      {:else if !data.customer.emailVerified && data.customer} 
         <EmailVerificationForm 
            data={data.emailVerificationForm} 
            bind:emailVerificationModalOpen={registerModalOpen} 
            userId={userId ? userId : data.customer!.id}
            redirect='' 
         />
      {:else}
         <div {@attach ()=> {registerModalOpen=false}}></div>
      {/if}
   {/snippet}
</FormModal>

<div in:fade={{duration:600}} out:fade={{duration:0}} class="mx-2 mt-14 sm:mt-12">
   {#if !data.customer}
      <div class="m-2">
         <button class="btn rounded-lg preset-filled-primary-50-950 createCustomerButton" onclick={()=>registerModalOpen=true}>Create new customer</button>
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
         <FormModal modalOpen={addressModalOpen}>
            {#snippet content()}
               <AddressForm data={data.addressForm} bind:addressModalOpen={addressModalOpen} userId={data.customer?.id}/>
            {/snippet}
         </FormModal>
      {#if data.address}
         <Address address={data.address} />
         <button class="btn preset-filled-primary-50-950" onclick={()=> addressModalOpen=true} type='button'>Edit Address</button>
      {:else}
         <button class="btn preset-filled-primary-50-950 addAddressButton" onclick={()=> addressModalOpen=true} type='button' {@attach addressButtonTour}>Add Address</button>   
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
               <div class="flex bg-primary-50-950 mt-2 p-2 rounded-lg justify-between paymentTypes" {@attach () => paymentMethodTour()}>
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
                        label={paymentType.substring(0,1) + paymentType.substring(1).toLowerCase()}
                     />
                     {/if}
                  {/each}
               </div>
               <FormSubmitWithProgress 
                  delayed={$delayed} 
                  timeout={$timeout} 
                  buttonText='The above is correct charge ${data.unit.deposit} deposit'
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