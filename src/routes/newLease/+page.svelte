<script lang="ts">
   import AddressCustomer from '$lib/displayComponents/customerViews/AddressCustomer.svelte';
   import AddressForm from '../../lib/forms/AddressForm.svelte'
   import FormProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
   import { superForm } from 'sveltekit-superforms';
   import type { PageData } from './$types';
	import UnitCustomer from '$lib/displayComponents/customerViews/UnitCustomer.svelte';
	import Checkbox from '$lib/formComponents/Checkbox.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import Header from '$lib/Header.svelte';
	import LeaseDiscountForm from '$lib/forms/LeaseDiscountForm.svelte';
	import { fade, } from 'svelte/transition';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
   import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
   import { currencyFormatter } from "$lib/utils/currencyFormatter";
	import Button from '$lib/core/Button.svelte';
	import type { Address } from '../../generated/prisma/browser';
	import AlternativeContactForm from '$lib/forms/AlternativeContactForm.svelte';
   let { data }: {data:PageData} = $props();
   // svelte-ignore state_referenced_locally
   let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data.leaseForm);
   let modalOpen = $state(false);
   let currentAddress = $state<Address>();
   let lienFormNeeded = $state(false)
</script>
<Header title='New lease'/>
<FormModal
   bind:modalOpen={modalOpen}
>
   {#snippet content()}
      <AddressForm data={data.addressForm} bind:addressModalOpen={modalOpen} userId={data.user?.id} address={currentAddress}/>
   {/snippet}
</FormModal>
<div in:fade={{duration:600}} class="mx-2 mt-14 sm:mt-12 mb-16 sm:mb-16 md:mb-16 lg:mb-8">
   {#if data.user}
      <UserCustomer user={data.user} />
   {/if}
   <FormMessage message={$message} />
   <form method="post" use:enhance>
      <input type='hidden' name='customerId' value={data.user?.id} />
      <input type='hidden' name='paymentType' value='CREDIT' />
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
         <Button
            type='button'
            label='Edit address'
            onClick={() => {
               currentAddress=data.address ? data.address : undefined;
               modalOpen=true;
            }}
         />
      {:else}
         <Button
            type='button'
            label='Add address'
            onClick={() => {
               modalOpen = true;
            }}
            classes='my-2'
         />
      {/if}
      {#if data.unit}
         <UnitCustomer unit={data.unit} classes='py-2 w-72'/>
         <input type="hidden" name="unitNum" value={data.unit.num}>
         {#if data.discount}
            <input type="hidden" name="discountId" value={data.discount.discountId}>
            <div class="py-2" in:fade={{duration:300}}>
               {#if data.discount.percentage}
                  Discount: <span class="text-green-700 dark:text-green-500">{data.discount.amountOff}%</span>
                  Monthly Rent: <span class="text-green-700 dark:text-green-500">{currencyFormatter(data.unit.advertisedPrice - (data.unit.advertisedPrice * (data.discount.amountOff / 100)))}</span>
               {:else}
                  Discount: <span class="text-green-700 dark:text-green-500">{currencyFormatter(data.discount.amountOff)}</span>
                  Monthly Rent: <span class="text-green-700 dark:text-green-500">{currencyFormatter(data.unit.advertisedPrice - data.discount.amountOff)}</span>
               {/if}
            </div>
         {/if}
      {/if}
      <div>
         {#if data.altContact}
            Alternative Contact
            <div class="flex flex-col">
               <UserCustomer user={data.altContact} />
               {#if data.altAddress}
                  <AddressCustomer address={data.altAddress} />
               {/if}
            </div>
         {:else}
            For your protection, in case we lose contact, please provide an alternate contact (parent, sibling, friend) who would know how to contact you. Any information will be kept confidential. You do not need to fill out the whole form but any information is helpful.
            <AlternativeContactForm data={data.alternativeContactForm} redirectTo='newLease' userId={data.user?.id} addressId={data.address?.addressId} unitNum={data.unitNum}/>
         {/if}
      </div>
      {#if data.unit && data.address && data.altContact}
         <Checkbox
            label='No property being stored has a lien'
            name='propertySubjectToLien'
            bind:value={$form.propertySubjectToLien}
         />
         <div class="font-bold w-72"> 
            IDAHO CODE SECTION 55-2304 REQUIRES TENANT TO NOTIFY LESSOR OF ANY LIEN HOLDERS OR SECURED PARTIES WHO HAVE AN INTEREST IN PROPERTY THAT IS STORED IN THE UNIT.
         </div>
         <input type="hidden" value={data.altContact.id} name="altContactId" />
         <FormProgress delayed={$delayed} timeout={$timeout} buttonText='The above is correct I would like to pay my deposit' classes='my-2'/>
      {/if}
   </form>
   {#if !data.discount}
      <div in:fade={{duration:600}} out:fade={{duration:0}}>
         <LeaseDiscountForm data={data.leaseDiscountForm} unitNum={data.unitNum} classes='w-72'/>
      </div>
   {/if}
</div>