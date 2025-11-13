<script lang="ts">
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
	import InvoiceEmployee from '$lib/displayComponents/InvoiceEmployee.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import type { Invoice } from '@prisma/client';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
   const selectedInvoices:Invoice[] = $state([]);
   function sendSelectedInvoices() {
      for(const invoice of selectedInvoices){
         const customer = data.customers.find((customer) => customer.id === invoice.customerId);
         const address = data.addresses.find((address) => address.userId === invoice.customerId);
         if(!customer || !address){
            return;
         }
         fetch('/api/sendInvoice', {method: 'POST', body: JSON.stringify({recordNum: invoice.invoiceNum})});
         const index = selectedInvoices.map((inv) => inv.invoiceNum).indexOf(invoice.invoiceNum);
         if(index > -1){
            selectedInvoices.splice(index, 1);
         }
      }
   }
</script>
<div class="mt-12 mb-8">
   <label for="selectAll" class="label-text">Select all invoices
      <input 
         type="checkbox" 
         name="selectAll" 
         id="selectAll" 
         class="input checkbox m-2"
         onchange={(e) => {
            if(e.currentTarget.checked){
               for(const invoice of data.invoices){
                  selectedInvoices.push(invoice);
               }
            } else {
               for(const invoice of data.invoices){
                  selectedInvoices.pop();
               }
            }
         }}
         checked={selectedInvoices.length === data.invoices.length ? true : undefined}
      />
   </label>
   {#each data.invoices as invoice}
   {@const customer = data.customers.find((customer) => customer.id === invoice.customerId)}
   {@const address = data.addresses.find((address) => address.userId === customer?.id)}
      <div class="grid grid-cols-3">
         <div class="justify-center">
            <input 
               type="checkbox" 
               group={selectedInvoices}
               name={invoice.invoiceNum.toString()}
               value={invoice.invoiceNum.toString()} 
               class='input checkbox mx-2'
               onchange={(e) => {
                  if(e.currentTarget.checked){
                     selectedInvoices.push(invoice)
                  } else {
                     const index = selectedInvoices.map((inv) => inv.invoiceNum).indexOf(invoice.invoiceNum);
                     console.log(index)
                     if(index > -1){
                        selectedInvoices.splice(index, 1);
                     }
                  }
               }}
               checked={ selectedInvoices.find((i) => i.invoiceNum === invoice.invoiceNum) ? true : undefined }
            />
         </div>
         <InvoiceEmployee {invoice} />
         <div class="flex flex-col">
            {#if customer}
               <UserEmployee user={customer} />
               {#if address}
                  <AddressEmployee {address} />
               {/if}
            {/if}
         </div>
      </div>
   {/each}
   <button onclick={sendSelectedInvoices} class="btn preset-filled-primary-50-950" >Email selected invoices out.</button>
</div>
{#each selectedInvoices as invoice}
   {invoice.invoiceNum},
{/each}