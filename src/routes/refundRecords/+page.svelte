<script lang="ts">
   import RefundRecordDisplay from '$lib/displayComponents/RefundRecordDisplay.svelte';
	import User from '$lib/displayComponents/User.svelte';
	import Header from '$lib/Header.svelte';
   import type { PageData } from './$types';
   import type { RefundRecord } from '@prisma/client';
   import { superForm } from 'sveltekit-superforms';
   import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import TextInput from '$lib/formComponents/TextInput.svelte';

   let { data }: { data: PageData } = $props();
   let { form, errors, constraints, enhance, message } = superForm(data.searchForm,{
        onChange(event){
            const inputText = event.get('search')
            if(inputText){
                search=inputText!;
            }
        },
        onSubmit(input) {
            input.cancel();
            const inputText = input.formData.get('search')?.toString();
            if(search){
                search=inputText!;
            }
        },
    });
   let pageNum = $state(1);
   let size = $state(25);
   let search = $state('')
   let slicedRefunds = $derived((refunds:RefundRecord[]) => refunds.slice((pageNum-1)*size, pageNum*size))
   let searchRefunds = $derived((refunds:RefundRecord[]) => refunds.filter((refund) => refund.refundNumber.toString().includes(search)))
</script>
<Header title='Refunds' />
{#await data.refunds}
   loading {data.refundCount} refunds
{:then refunds}
   <form method="POST" use:enhance>
      <TextInput
         bind:value={$form.search}
         errors={$errors.search}
         constraints={$constraints.search}
         label='Search'
         name='search'
         placeholder='Search by refund number'
      />
      <button class="btn">Submit</button>
      <button class="btn" type="button" onclick={()=>{search=''; $form.search=''}}>Clear</button>
   </form>
   {#each slicedRefunds(searchRefunds(refunds)) as refund (refund.refundNumber)}
   {@const {customer} = refund }
   <div class="flex">
      <RefundRecordDisplay refundRecord={refund} />
      {#if customer}
      <User user={customer} />
      {/if}
   </div>

   {/each}
   <footer class="flex justify-between">
      <select name="size" id="size" class="select" bind:value={size}>
         {#each [5,10,25,50] as v}
         <option value={v}>Show {v} refund records per page</option>
         {/each}
         <option value={refunds.length}>Show all {refunds.length} Refund records</option>
      </select>
      <Pagination data={refunds} bind:page={pageNum} bind:pageSize={size} alternative/>
   </footer>
{/await}