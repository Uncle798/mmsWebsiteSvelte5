<script lang="ts">
   import LeaseEmployee from '$lib/displayComponents/LeaseEmployee.svelte';
   import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   import type { PageData } from './$types';
   import Header from '$lib/Header.svelte';
   import Pagination from '$lib/displayComponents/Pagination.svelte';
   import { fade } from 'svelte/transition';
   import Search from '$lib/forms/Search.svelte';
   import Revenue from '$lib/displayComponents/Revenue.svelte';
   import type { Invoice, Lease, PaymentRecord, Unit, User } from '@prisma/client';
   import Address from '$lib/displayComponents/AddressEmployee.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { PanelTopClose, SearchIcon } from 'lucide-svelte';
	import UserNotesForm from '$lib/forms/UserNotesForm.svelte';
	import LeaseEndForm from '$lib/forms/LeaseEndForm.svelte';
	import UnitNotesForm from '$lib/forms/UnitNotesForm.svelte';
	import { onNavigate } from '$app/navigation';
   let { data }: { data: PageData } = $props();
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('');
   let slicedSource = $derived((customers:User[]) => customers.slice((pageNum-1)*size, pageNum*size));
   let searchedSource = $derived((customers:User[]) => customers.filter((customer) => {
      return customer.familyName?.toLowerCase().includes(search.toLowerCase()) 
      || customer.givenName?.toLowerCase().includes(search.toLowerCase())
      || customer.organizationName?.toLowerCase().includes(search.toLowerCase())
   }))
   let totalLeased = $derived((leases:Lease[]) => {
      let totalLeased = 0;
      leases.forEach((lease) => {
         totalLeased += lease.price
      });
      return totalLeased
   })
   let totalInvoiced = $derived((invoices:Invoice[]) => {
      let total = 0;
      for(const invoice of invoices){
         total += invoice.invoiceAmount;
      }
      return total;
   });
   let totalPaid = $derived((paymentRecords:PaymentRecord[]) =>{
      let total = 0;
      for(const payment of paymentRecords){
         total += payment.paymentAmount;
      }
      return total;
   })
   let overdueInvoices = $derived((invoices:Invoice[]) => invoices.filter((invoice) => {
      return invoice.invoiceDue <= new Date() && (invoice.invoiceAmount > invoice.amountPaid);
   }))
   let searchDrawerOpen = $state(false);
   const currencyFormatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   let leaseEndModalOpen = $state(false);
   let currentLeaseId = $state('');
   let currentUnit = $state<Unit>();
   function leaseEndModal(leaseId:string, unit:Unit){
      currentLeaseId = leaseId;
      currentUnit = unit;
      leaseEndModalOpen = true;
   }
   onNavigate(() => {
      leaseEndModalOpen = false;
      currentLeaseId = '';
      currentUnit = undefined;
   });

</script>
<Header title='Current Customers'/>
{#await data.customers}
   <div class="mt-14 sm:mt-10 mx-2">
      Loading {data.customerCount} customers...
   </div>
{:then customers}
   {#await data.leases}
      <div class="mt-14 sm:mt-10 mx-2">
         Loading leases...
      </div>   
   {:then leases} 
      {#await data.addresses}
         <div class="mt-14 sm:mt-10 mx-2">
            Loading addresses...
         </div>
      {:then addresses}
         {#await data.invoices}
            <div class="mt-14 sm:mt-10 mx-2">
               Loading invoices...
            </div>
         {:then invoices}
            {#await data.paymentRecords}
               <div class="mt-14 sm:mt-10 mx-2">
                  Loading payments...
               </div>               
            {:then paymentRecords}  
               {#await data.units}
                  <div class="mt-14 sm:mt-10 mx-2">
                     Loading units...
                  </div>
               {:then units}
                  <div in:fade={{duration:600}}>
                     <Revenue label='Current monthly invoiced' amount={totalLeased(leases)} classes='fixed top-11 sm:top-9 p-1 w-screen left-0 bg-tertiary-50-950 rounded-b-lg'/>
                     <Modal
                        open={searchDrawerOpen}
                        onOpenChange={(event)=>(searchDrawerOpen = event.open)}
                        triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50 h-12 sm:h-8'
                        contentBase='bg-surface-100-900 h-[140px] w-screen rounded-b-lg'
                        positionerJustify=''
                        positionerAlign=''
                        positionerPadding=''
                        transitionsPositionerIn={{y:-140, duration: 600}}
                        transitionsPositionerOut={{y:-140, duration: 600}}
                        modal={false}
                     >
                        {#snippet trigger()}
                           <SearchIcon aria-label='search' />
                        {/snippet}
                        {#snippet content()}
                           <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose aria-label='Close'/></button>
                           <Search bind:search={search} searchType='customer name' data={data.userSearchForm} classes='mx-2 mt-11'/>
                        {/snippet}
                     </Modal>
                     <Modal
                        open={leaseEndModalOpen}
                        onOpenChange={(event) =>(leaseEndModalOpen = event.open)}
                        contentBase='card bg-surface-100-900 p-2 shadow-xl max-w-screen-sm'
                        backdropClasses='backdrop-blur-lg'
                     >
                        {#snippet content()}
                           <LeaseEndForm data={data.leaseEndForm} {leaseEndModalOpen} leaseId={currentLeaseId} employee={true}/>
                           {#if currentUnit}
                              <UnitNotesForm data={data.unitNotesForm} unit={currentUnit}/>
                           {/if}
                           <button onclick={() => leaseEndModalOpen = false} class='btn preset-filled-primary-50-950'>Cancel</button>
                        {/snippet}
                     </Modal>
                     <div class="grid grid-cols-1 mx-1 sm:mx-2 gap-y-2 gap-x-1 mt-20 sm:mt-18">
                        {#each slicedSource(searchedSource(customers)) as customer}
                        {@const address = addresses.find((address) => address.userId === customer.id)}
                        {@const customerLeases = leases.filter((lease) => lease.customerId === customer.id)}
                        {@const customerInvoices = invoices.filter((invoice) => invoice.customerId === customer.id)}
                        {@const customerPayments = paymentRecords.filter((payment) => payment.customerId === customer.id)}
                           <div class="border rounded-lg border-primary-50-950 sm:grid sm:grid-cols-2">
                              <div class="p-2">
                                 <UserEmployee user={customer} classes=''/>
                                 {#if address}
                                    <Address {address} />
                                 {/if}
                                 <UserNotesForm user={customer} data={data.userNotesForm} />
                                 <div class="flex flex-col sm:flex-row gap-2 bg-primary-contrast-100-900 p-2 rounded-lg">
                                    <p class="text-error-400-600">Total invoiced: {currencyFormatter.format(totalInvoiced(customerInvoices))}</p>
                                    <p class="text-success-300-700">Total paid: {currencyFormatter.format(totalPaid(customerPayments))}</p>
                                    {#if totalInvoiced(overdueInvoices(customerInvoices)) > 0 && overdueInvoices(customerInvoices).length > 1}
                                       <p class="text-error-100-900">Overdue amount: <a href="/paymentRecords/new?userId={customer.id}">{currencyFormatter.format(totalInvoiced(overdueInvoices(customerInvoices)))}</a></p>
                                    {:else if overdueInvoices(customerInvoices).length === 1}
                                       <p class="text-error-100-900">Overdue amount: <a href="/paymentRecords/new?invoiceNum={overdueInvoices(customerInvoices)[0].invoiceNum}" class="">{currencyFormatter.format(totalInvoiced(overdueInvoices(customerInvoices)))}</a></p>
                                    {/if}
                                 </div>
                              </div>
                              {#if customerLeases}
                                 {#each customerLeases as lease}
                                 {@const unit = units.find((unit) => unit.num === lease.unitNum)}
                                    <div>
                                       <LeaseEmployee {lease} classes='p-2 max-h-64'/>
                                       <a href="/invoices/new?leaseId={lease.leaseId}" class="btn preset-filled-primary-50-950 mx-2">Make an invoice for this lease</a>
                                       {#if unit}
                                          <button type="button" onclick={()=>leaseEndModal(lease.leaseId, unit)} class="btn preset-filled-primary-50-950">End lease</button>
                                       {/if}
                                    </div>
                                 {/each}
                              {/if}
                           </div>
                        {/each}
                     </div>
                     <Pagination bind:pageNum={pageNum} bind:size={size} label='users' array={searchedSource(customers)}/>
                  </div>
               {/await}
            {/await}            
         {/await}    
      {/await}
   {/await}
{/await}