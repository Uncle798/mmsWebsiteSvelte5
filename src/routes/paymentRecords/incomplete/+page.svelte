<script lang="ts">
   import Header from '$lib/Header.svelte';
   import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
   import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
   import FormModal from '$lib/displayComponents/Modals/FormModal.svelte';
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';

   let { data }: { data: PageData } = $props();
   let modalOpen = $state(false);
   let currentPaymentRecordNum = $state(0);
   let { message, enhance, delayed, timeout } = superForm(data.paymentRecordDeleteForm, {
      onUpdate(){
         invalidateAll();
      }
   })
</script>

<Header title='Incomplete Payment Records' />

<FormModal
   modalOpen={modalOpen}
>
   {#snippet content()}
      <FormMessage message={$message} />
      <form method="POST" use:enhance>
         <input type="hidden" name='paymentRecordNumber' value={currentPaymentRecordNum} />
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Yes permanently delete payment record {currentPaymentRecordNum}' />
      </form>
   {/snippet}
</FormModal>

<div transition:fade={{duration:600}}>
   {#each data.paymentRecords as paymentRecord}
      <div class="card p-4">
         <PaymentRecordEmployee paymentRecord={paymentRecord} />
         <p><a href="/paymentRecords/new?userId={paymentRecord.customerId}&invoiceNum={paymentRecord.invoiceNum}" class="btn">Take a payment for payment record {paymentRecord.paymentNumber}</a></p>
         <button class="btn" onclick={()=>{ modalOpen=true; currentPaymentRecordNum=paymentRecord.paymentNumber}}>Delete payment record number {paymentRecord.paymentNumber}</button>
      </div>
   {/each}
</div>