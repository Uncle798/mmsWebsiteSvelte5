<script lang="ts">
   import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
   import type { PageData } from './$types';
   import NewRefundForm from '$lib/forms/NewRefundForm.svelte';
   import type { PaymentRecord, User } from '@prisma/client';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Header from '$lib/Header.svelte';
	import { PanelTopClose, SearchIcon } from 'lucide-svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
   let { data }: { data: PageData } = $props();
   let size = $state(25);
   let pageNum = $state(1);
   let search = $state('');
   const slicedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
   const searchedPayments = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNotes?.toLowerCase().includes(search.toLowerCase())));
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
   );
</script>
<Header title='New Refund' />
{#if data.paymentRecord}
   <div class="mt-14 sm:mt-10 mx-1 sm:mx-2">
      <div class="border-2 border-primary-50-950 rounded-lg grid sm:grid-cols-2 gap-2">
         <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='px-2' />
         <div>
            {#if data.customer}
               <UserEmployee user={data.customer} />
            {/if}
            {#if data.address}
               <AddressEmployee address={data.address} />
            {/if}
         </div>
      </div>
      <NewRefundForm data={data.refundForm} paymentRecord={data.paymentRecord} classes='p-2'/>
   </div>
{:else}
   {#await data.paymentRecords}
      <div class="mt-14 sm:mt-10 mx-1 sm:mx-2">
         Loading deposits ...
      </div>
   {:then paymentRecords}
      {#await data.customers}
         <div class="mt-14 sm:mt-10 mx-1 sm:mx-2">
            Loading customers...
         </div>
      {:then customers} 
         <Modal
            open={searchDrawerOpen}
            onOpenChange={(event)=>(searchDrawerOpen = event.open)}
            triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50 h-12 sm:h-auto'
            contentBase='bg-surface-100-900 h-[350px] w-screen rounded-lg'
            positionerJustify=''
            positionerAlign=''
            positionerPadding=''
            transitionsPositionerIn={{y:-350, duration: 600}}
            transitionsPositionerOut={{y:-350, duration: 600}}
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
                  classes='m-1 sm:m-2 mt-11'
               />
               <Search
                  bind:search={search}
                  searchType='payment notes'
                  data={data.searchForm}
                  classes='m-1 sm:m-2 mt-11'
               />
            {/snippet}
         </Modal>
         {#if paymentRecords}
            {#if customers}                
               <div class="mt-14 sm:mt-10 mx-1 sm:mx-2 grid grid-cols-1 gap-y-2">
                  {#each slicedPayments(searchedPayments(searchByUser(paymentRecords, currentUsers(customers)))) as paymentRecord}
                  {@const customer = customers.find((customer) => customer.id === paymentRecord.customerId)}
                     <div class="border-2 border-primary-50-950 rounded-lg grid grid-cols-1 sm:grid-cols-2 ">
                        {#if customer}
                           <UserEmployee user={customer} classes='mx-2'/>
                        {/if}
                        <PaymentRecordEmployee {paymentRecord} />
                        <a href="/refundRecords/new?paymentNum={paymentRecord.paymentNumber}" class="btn preset-filled-primary-50-950 sm:col-span-2 m-1">Refund this payment</a>
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
