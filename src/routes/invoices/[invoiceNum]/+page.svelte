<script lang="ts">
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
   import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import EmailCustomer from '$lib/emailCustomer.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';

   let { data }: { data: PageData } = $props();
</script>
{#if data.user?.employee}
   {#if data.invoice}      
      <Header title="Invoice number {data.invoice.invoiceNum}" />
      <div class="flex flex-col sm:flex-row gap-x-1 mx-1 sm:mx-2 mt-14 sm:mt-10 border-2 border-primary-50-950 rounded-lg">
         <div class="flex flex-col">
         <InvoiceEmployee invoice={data.invoice} classes="min-w-64 " />
            {#if data.customer?.email && data.customer?.emailVerified}         
               <EmailCustomer
                  recordNum={data.invoice.invoiceNum}
                  apiEndPoint='/api/sendInvoice'
                  emailAddress={data.customer?.email}
                  buttonText='Send invoice'
               />
            {/if}
            {#if !data.invoice.paymentRecordNum}
               <a href="/paymentRecords/new?invoiceNum={data.invoice.invoiceNum}" class="btn rounded-lg preset-filled-primary-50-950 mx-2 mb-2 w-84">Make a payment record for this invoice</a>
            {/if}
         </div>
         <div class="flex flex-col min-w-64"> 
            {#if data.customer}
               <UserEmployee user={data.customer} classes="px-2 pt-2" />
            {/if}
            {#if data.address}
               <Address address={data.address} classes='px-2'/>
            {/if}
         </div>
      </div>
   {/if}
{:else}
   {#if data.invoice}
      {#if data.user?.id === data.customer?.id}         
         <Header title="Invoice number {data.invoice.invoiceNum}" />
         <div class="flex flex-col sm:flex-row gap-x-1 mx-1 sm:mx-2 mt-14 sm:mt-10 mb-20 sm:mb-12 lg:mb-7 border-2 border-primary-50-950 rounded-lg w-fit">
            <InvoiceCustomer invoice={data.invoice} classes="min-w-64" />
            <div class="flex flex-col min-w-64"> 
               {#if data.customer}
                  <UserCustomer user={data.customer} classes="px-2 pt-2" />
               {/if}
               {#if data.address}
                  <Address address={data.address} classes='px-2'/>
               {/if}
               {#if data.customer?.email && data.customer?.emailVerified}         
                  <EmailCustomer
                     recordNum={data.invoice.invoiceNum}
                     apiEndPoint='/api/sendInvoice'
                     emailAddress={data.customer.email}
                     buttonText='Send invoice'
                     classes='m-1 sm:m-2'
                  />
               {/if}
            </div>
         </div>
      {/if}
   {/if}
{/if}