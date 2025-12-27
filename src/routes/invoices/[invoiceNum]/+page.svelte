<script lang="ts">
	import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import InvoiceCustomer from '$lib/displayComponents/customerViews/InvoiceCustomer.svelte';
	import UserCustomer from '$lib/displayComponents/customerViews/UserCustomer.svelte';
   import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import EmailCustomer from '$lib/EmailCustomer.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import DownloadPDFButton from '$lib/DownloadPDFButton.svelte';
	import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import DeleteRecordForm from '$lib/forms/DeleteRecordForm.svelte';
	import InvoiceChangeForm from '$lib/forms/InvoiceChangeForm.svelte';
	import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';
	import { goto } from '$app/navigation';
	import ProgressRing from '$lib/displayComponents/ProgressRing.svelte';
	import { PUBLIC_COMPANY_NAME } from '$env/static/public';
	import { EllipsisVertical, MenuIcon } from 'lucide-svelte';

   let { data }: { data: PageData } = $props();
   let modalOpen = $state(false);
   let modalReason = $state('');
   let emailing = $state(false);
   let emailed = $state(false);
   let menuOpen = $state(false);
</script>

{#if data.user?.employee}
   {#if data.invoice}  
      {#if data.deleteRecordForm}       
         <FormModal
            bind:modalOpen={modalOpen}
         >
            {#snippet content()}
               {#if modalReason === 'deleteInvoice'}
                  <DeleteRecordForm data={data.deleteRecordForm} recordNum={data.invoice?.invoiceNum} recordType='invoice' bind:modalOpen={modalOpen}/>
               {:else if modalReason === 'editInvoice'}
                  <InvoiceChangeForm data={data.invoiceChangeForm} invoice={data.invoice} bind:modalOpen={modalOpen} />
               {/if}
            {/snippet}
         </FormModal>
      {/if}    
      <Header title="Invoice number {data.invoice.invoiceNum}" />
      <div class="flex flex-col sm:flex-row gap-x-1 mx-1 sm:mx-2 mt-14 sm:mt-10 border-2 border-primary-50-950 rounded-lg">
         <div class="flex relative">
            <InvoiceEmployee invoice={data.invoice} classes="min-w-64 mx-2 " />
            <Menu 
               onSelect={async (e) => {
                  switch (e.value) {
                     case 'newPayment':
                        menuOpen = false;
                        goto(`/paymentRecords/new?invoiceNum=${data.invoice.invoiceNum}`);
                        break;
                     case 'email':
                        emailing = true;
                        const res = await fetch('/api/sendInvoice', {
                           method: "POST",
                           body: JSON.stringify({recordNum:data.invoice.invoiceNum})
                        });
                        const body = await res.json();
                        if(body.success){
                           emailed = true;
                           emailing = false;
                           setTimeout(() => { emailed = false; menuOpen = false; }, 5000);
                        }else {

                        }
                        break;
                     case 'downloadPDF':
                        menuOpen = false;
                        break;
                     case 'editInvoice':
                        modalReason='editInvoice'
                        modalOpen = true;
                        menuOpen = false;
                        break;
                     case 'deleteInvoice':
                        modalReason = 'deleteInvoice';
                        modalOpen = true;
                        menuOpen = false;
                        break;
                     default:
                        break;
                  }
               }}
               open={menuOpen}
               onOpenChange={(e) => menuOpen=e.open}
               closeOnSelect={false}
               onPointerDownOutside={(e) => {
                  menuOpen = false;
               }}
               onInteractOutside={(e) => {
                  menuOpen = false;
               }}
               onFocusOutside={(e) => {
                  menuOpen = false;
               }}
            >
               <Menu.Trigger class='absolute top-1 left-1' ><MenuIcon aria-label='Invoice Menu' class='preset-filled-primary-50-950 rounded-sm size-8 p-1' /></Menu.Trigger>
               <Portal>
                  <Menu.Positioner>
                     <Menu.Content class='backdrop-blur-sm'>
                        {#if data.invoice.amountPaid < data.invoice.invoiceAmount}
                           <Menu.Item value='newPayment'>Make a payment for invoice {data.invoice.invoiceNum}</Menu.Item>
                        {:else}   
                           <Menu.Item value='newPayment' disabled={true}>Make a payment for invoice {data.invoice.invoiceNum}</Menu.Item>
                        {/if}
                        {#if emailing}
                           <Menu.Item value='email' disabled={true}>
                              Emailing <ProgressRing value={null} />
                           </Menu.Item>
                        {:else if emailed}
                           <Menu.Item value='email' disabled={true}>
                              Emailed
                           </Menu.Item>
                        {:else}
                           <Menu.Item value='email'>
                              Email invoice to customer
                           </Menu.Item>
                        {/if}
                        <Menu.Item value='downloadPDF'>
                           <a href="/api/downloadPDF?invoiceNum={data.invoice.invoiceNum.toString()}" 
                              download='{PUBLIC_COMPANY_NAME} invoice number {data.invoice.invoiceNum}.pdf'
                           >
                              Download PDF
                           </a>
                        </Menu.Item>
                        {#if data.invoice.amountPaid < data.invoice.invoiceAmount}                           
                           <Menu.Item value='editInvoice'>
                              Edit invoice {data.invoice.invoiceNum}
                           </Menu.Item>
                        {:else}
                           <Menu.Item value='editInvoice' disabled={true}>
                              Edit invoice {data.invoice.invoiceNum}
                           </Menu.Item>
                        {/if}
                        {#if data.invoice.amountPaid < data.invoice.invoiceAmount}
                           <Menu.Item value='deleteInvoice'>
                              Delete invoice {data.invoice.invoiceNum}
                           </Menu.Item>
                        {:else}
                           <Menu.Item value='deleteInvoice' disabled={true}>
                              Delete invoice {data.invoice.invoiceNum}
                           </Menu.Item>
                        {/if}
                     </Menu.Content>
                  </Menu.Positioner>
               </Portal>
            </Menu>
         </div>
         <div class="flex flex-col w-1/2"> 
            {#if data.customer}
               <UserEmployee user={data.customer} classes="px-2 pt-2" />
            {/if}
            {#if data.address}
               <Address address={data.address} classes='px-2'/>
            {/if}
         </div>
      </div>
      {#if data.paymentRecords}
         <div class="flex flex-col gap-2 mx-2 mt-2 mb-8">
            {#each data.paymentRecords as payment}
               <PaymentRecordEmployee paymentRecord={payment} classes='border border-primary-50-950 rounded-lg p-2'/>
            {/each}
         </div>
      {/if}
   {/if}
{:else}
   {#if data.invoice}
      {#if data.user?.id === data.customer?.id}         
         <Header title="Invoice number {data.invoice.invoiceNum}" />
         <div class="flex flex-col sm:flex-row gap-x-1 mx-1 sm:mx-2 mt-14 sm:mt-10 mb-20 sm:mb-12 lg:mb-8 border-2 border-primary-50-950 rounded-lg w-fit">
            <InvoiceCustomer invoice={data.invoice} classes="min-w-64" />
            <div class="flex flex-col min-w-64"> 
               {#if data.customer}
                  <UserCustomer user={data.customer} classes="px-2 pt-2" />
               {/if}
               {#if data.address}
                  <Address address={data.address} classes='px-2'/>
               {/if}
               <div class="flex flex-row gap-2">
                  {#if data.customer?.email && data.customer?.emailVerified}         
                     <EmailCustomer
                        recordNum={data.invoice.invoiceNum}
                        apiEndPoint='/api/sendInvoice'
                        emailAddress={data.customer.email}
                        buttonText='Send invoice'
                     />
                  {/if}
                  <DownloadPDFButton
                     recordType='invoiceNum'
                     num={data.invoice.invoiceNum}
                  />
               </div>
            </div>
         </div>
      {/if}
   {/if}
{/if}