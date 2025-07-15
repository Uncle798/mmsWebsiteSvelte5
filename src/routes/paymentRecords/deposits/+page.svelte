<script lang="ts">
    import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import Header from '$lib/Header.svelte';
    import { Modal } from '@skeletonlabs/skeleton-svelte'
    import type { PageData } from './$types';
    import type { PaymentRecord, User } from '@prisma/client';
	import RefundForm from '$lib/forms/NewRefundForm.svelte';
	import Search from '$lib/forms/Search.svelte';
	import Pagination from '$lib/displayComponents/Pagination.svelte';
	import Revenue from '$lib/displayComponents/Revenue.svelte';
	import UserEmployee from '$lib/displayComponents/UserEmployee.svelte';
	import AddressEmployee from '$lib/displayComponents/AddressEmployee.svelte';
   import { PanelTopClose, SearchIcon } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
    interface Props {
        data: PageData;
    }
    let { 
        data, 
    }: Props = $props();
    let refundModalOpen=$state(false); 
    let pageNum = $state(1);
    let size = $state(25);
    let search = $state('');
    let noteSearch = $state('');
    const numberFormatter = new Intl.NumberFormat('en-US');
    const slicedSource = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.slice((pageNum -1) * size, pageNum*size));
    const searchedPaymentRecords = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNumber.toString().includes(search) )) 
    const searchByNotes = $derived((paymentRecords:PaymentRecord[]) => paymentRecords.filter((paymentRecord) => paymentRecord.paymentNotes?.includes(noteSearch)));
    let paymentRecord=$state<PaymentRecord>({} as PaymentRecord);
    function refundModal(deposit:PaymentRecord) {
        paymentRecord = deposit;
        refundModalOpen = true;
    }
    let totalRevenue = $derived((paymentRecords:PaymentRecord[]) => {
        let totalRevenue = 0;
        paymentRecords.forEach((paymentRecord) => {
            if(paymentRecord.paymentCompleted && !paymentRecord.refunded){
                totalRevenue += paymentRecord.paymentAmount
            }
        })
        return totalRevenue;
    })

    let nameSearch = $state('')
    let currentUsers = $derived((users:User[]) => users.filter((user) => {
        return user.givenName?.toLowerCase().includes(nameSearch.toLowerCase()) 
        || user.familyName?.toLowerCase().includes(nameSearch.toLowerCase()) 
        || user.organizationName?.toLowerCase().includes(nameSearch.toLowerCase());
    }))
    const searchByUser = $derived((paymentRecords:PaymentRecord[], customers:User[]) => {
        const users = currentUsers(customers);
        const records:PaymentRecord[] = []
        users.forEach((user) => {
            const userRecords = paymentRecords.filter((paymentRecord) => {
                return paymentRecord.customerId === user.id
            })
            userRecords.forEach((record) => {
                records.push(record);
            })
        })
        return records
    })
   let searchDrawerOpen = $state(false);
</script>
<Header title='Deposits' />
<Modal
   bind:open={refundModalOpen}
   contentBase="card bg-surface-400-600 p-4 space-y-4 shadow-xl"
   backdropClasses=""
   modal={true}
>  
{#snippet content()}
   <RefundForm data={data.refundForm} paymentRecord={paymentRecord}/>
   <button class="btn rounded-lg preset-filled-primary-50-950" onclick={()=>refundModalOpen = false}>Close</button>
{/snippet}

</Modal>

{#await data.deposits}
    <div class="mt-12 sm:mt-10 m-1 sm:m-2">
        Loading {numberFormatter.format(data.depositCount)} deposits
    </div>
{:then deposits} 
   {#await data.customers}
      <div class="mt-12 sm:mt-10">
         Loading customers...
      </div>
   {:then customers} 
      {#await data.addresses}
         <div class="mt-12 sm:mt-10">
               Loading addresses...
         </div>
      {:then addresses} 
         <Revenue amount={totalRevenue(searchedPaymentRecords(deposits))} label='Amount of deposits' classes='bg-tertiary-50-950 w-screen rounded-b-lg fixed top-9 p-2' />
         <Modal
            open={searchDrawerOpen}
            onOpenChange={(event)=>(searchDrawerOpen = event.open)}
            triggerBase='btn preset-filled-primary-50-950 rounded-lg fixed top-0 right-0 z-50'
            contentBase='bg-surface-100-900 h-[340px] w-screen rounded-lg'
            positionerJustify=''
            positionerAlign=''
            positionerPadding=''
            transitionsPositionerIn={{y:-340, duration: 600}}
            transitionsPositionerOut={{y:-340, duration: 600}}
            modal={false}
         >
            {#snippet trigger()}
               <SearchIcon aria-label='Search'/>
            {/snippet}
            {#snippet content()}
               <button onclick={()=>searchDrawerOpen=false} class='btn preset-filled-primary-50-950 rounded-lg m-1 absolute top-0 right-0'><PanelTopClose aria-label='Close'/></button>
               <div class="mt-9 mx-1 sm:mx-2">
                  <Search bind:search={search} searchType='payment record number' data={data.searchForm} classes=''/>
                  <Search bind:search={noteSearch} searchType='Payment notes' data={data.searchForm} classes=''/>
                  <Search bind:search={nameSearch} searchType='By user' data={data.searchForm} classes=''/>
               </div>
            {/snippet}
         </Modal>
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-20" in:fade={{duration:600}} out:fade={{duration:0}}>
            {#each slicedSource(searchedPaymentRecords(searchByNotes(searchByUser(deposits, customers)))) as deposit}
            {@const user = customers.find((customer) => customer.id === deposit.customerId)}
               <div class="flex flex-col border-2 border-primary-50-950 rounded-lg mx-1 sm:mx-2">
                  <PaymentRecordEmployee paymentRecord={deposit} classes='px-2'/>
                  <button type="button" class="btn rounded-lg preset-filled-primary-50-950 m-2" onclick={() => refundModal(deposit)}>Refund this deposit</button>
                  <div class="m-2">
                        {#if user}
                        {@const address = addresses.find((address) => address.userId === user.id)}
                           <UserEmployee {user} />
                           {#if address}
                              <AddressEmployee {address} />
                           {/if}
                        {/if}
                  </div>
               </div>
            {/each}
            <Pagination pageNum={pageNum} size={size} array={searchedPaymentRecords(searchByNotes(searchByUser(deposits, customers)))} label='invoices' classes='col-span-full' />
         </div>
      {/await}
   {/await}
{/await}