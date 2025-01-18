<script lang="ts">
    import PaymentRecord from '$lib/displayComponents/PaymentRecord.svelte';
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
	import NewRefundForm from '$lib/forms/NewRefundForm.svelte';
    import { superForm } from 'sveltekit-superforms';
    let { data }: { data: PageData } = $props();
    let selectedPayment = $state(['']);
    let paymentNumber = $state(0)
    interface ComboboxData {
        label: string;
        value: string;
    }
    const paymentRecordComboboxData:ComboboxData[] = [];
    data.deposits?.forEach((paymentRecord) => {
        const label = paymentRecord.paymentNotes ? paymentRecord.paymentNotes : '';
        const value = paymentRecord.paymentNumber.toString();
        paymentRecordComboboxData.push({label, value})
    })
    let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data.searchForm, {
      onSubmit({formData}) {

      },
   });
</script>

{#if data.deposits}    
<form method="POST" use:enhance>
    <Combobox 
        data={paymentRecordComboboxData}
        bind:value={selectedPayment}
        placeholder="Select deposit to refund"
        openOnClick={true}
        onValueChange={(details) =>{
            paymentNumber = parseInt(details.value[0], 10)
        }}
    />
</form>
{/if}

<NewRefundForm data={data.refundForm} paymentRecordNumber={paymentNumber}/>