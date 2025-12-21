<script lang="ts">
	import Button from '$lib/core/Button.svelte';
	import Expense from '$lib/displayComponents/Expense.svelte';
   import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import ExpenseDeleteForm from '$lib/forms/ExpenseDeleteForm.svelte';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
   let modalOpen = $state(false);
</script>
<FormModal
   bind:modalOpen={modalOpen}
>
   {#snippet content()}
      {#if data.expense}   
         <ExpenseDeleteForm data={data.expenseDeleteForm} expense={data.expense} />
      {/if}
   {/snippet}
</FormModal>
<div class="mt-14 sm:mt-12 mb-8 mx-2">

   {#if data.expense}
      <Expense expense={data.expense} vendor={data.expense.vendor} employee={data.expense.employee} />
      <Button
         label='Delete expense'
         type='button'
         onClick={() => {
            modalOpen=true;
         }}
      />
   {/if}
</div>