<script lang="ts">
   import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
   import NewRefundForm from '$lib/forms/NewRefundForm.svelte';
   import type { PaymentRecord, User } from '@prisma/client';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
   import HorizontalDivider  from '$lib/displayComponents/HorizontalDivider.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Header from '$lib/Header.svelte';
	import { PanelTopClose, SearchIcon } from 'lucide-svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
   let { data }: { data: PageData } = $props();
   let selectedPayment = $state<PaymentRecord>();
   let allPayments = $state<PaymentRecord[]>([]);
   let size = $state(25);
   let pageNum = $state(1);
   let search = $state('')
   const slicedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
   const searchedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNotes?.includes(search)));
   let searchDrawerOpen = $state(false);
   let nameSearch = $state('');
   const searchByUser = $derived((paymentRecords:PaymentRecord[], customers:User[]) =>{
      const customerPayments:PaymentRecord[] = [];
      for(const customer of customers){
         const payments = paymentRecords.filter((paymentRecord) => {
            return paymentRecord.customerId === customer.id;
         })
         for(const payment of payments){
            customerPayments.push(payment)
         }
      }
      return customerPayments;
   });
   const currentUsers = $derived((users:User[]) => 
      users.filter((user) => {
         return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) || 
         user.familyName?.toLowerCase().includes(nameSearch.toLowerCase()) || 
         user.organizationName?.toLowerCase().includes(nameSearch.toLowerCase())
      })
   )
</script>
<Header title='New Refund' />
{#if selectedPayment}
   <PaymentRecordEmployee paymentRecord={selectedPayment} classes='mt-12 sm:mt-10'/>
   <HorizontalDivider />   
   <NewRefundForm data={data.refundForm} paymentRecord={selectedPayment} classes='p-2'/>
{:else}
   {#await data.paymentRecords}
      <div class="mt-12 sm:mt-10 mx-1 sm:mx-2">
         Loading deposits ...
      </div>
   {:then paymentRecords}
      {#await data.customers}
         <div class="mt-12 sm:mt-10 mx-1 sm:mx-2">
            Loading customers...
         </div>
      {:then customers} 
         <Modal
            open={searchDrawerOpen}
            onOpenChange={(event)=>(searchDrawerOpen = event.open)}
            triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50'
            contentBase='bg-surface-100-900 h-[400px] w-screen rounded-lg'
            positionerJustify=''
            positionerAlign=''
            positionerPadding=''
            transitionsPositionerIn={{y:-400, duration: 600}}
            transitionsPositionerOut={{y:-400, duration: 600}}
            modal={false}
         >
            {#snippet trigger()}
               <SearchIcon aria-label='Search' />
            {/snippet}
            {#snippet content()}
               <button onclick={()=>(searchDrawerOpen=false)} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose aria-label='Close'/></button>
               <Search
                  bind:search={nameSearch}
                  searchType='customer name'
                  data={data.searchForm}
                  classes='m-1 sm:m-2'
               />
            {/snippet}
         </Modal>
         {#if paymentRecords}
            {#if customers}                
               <div class="mt-12 sm:mt-10 mx-1 sm:mx-2 grid grid-cols-2">
                  {#each slicedPayments(searchedPayments(searchByUser(paymentRecords, currentUsers(customers)))) as paymentRecord}
                  {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId)}
                     <div class="border-2 border-primary-50-950 rounded-lg">
                        <PaymentRecordEmployee {paymentRecord} />
                        {#if customer}
                           <UserEmployee user={customer} />
                        {/if}
                        <button class="btn preset-filled-primary-50-950 col-span-2">Refund this payment</button>
                     </div>
                  {/each}
               </div>
               <Pagination 
                  bind:size={size} 
                  bind:pageNum={pageNum} 
                  array={searchedPayments(searchByUser(paymentRecords, currentUsers(customers)))}
                  label='payment records'
               />
            {/if}
         {/if}
      {/await}
   {/await}
{/if}
