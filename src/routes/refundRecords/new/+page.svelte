<script lang="ts">
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
	import NewRefundForm from '$lib/forms/NewRefundForm.svelte';
    import { superForm } from 'sveltekit-superforms';
	import { onMount } from 'svelte';
	import TextInput from '$lib/formComponents/TextInput.svelte';
	import FormSubmitWithProgress from '$lib/formComponents/FormSubmitWithProgress.svelte';
	import PaymentRecord from '$lib/displayComponents/PaymentRecordEmployee.svelte';
	import FormMessage from '$lib/formComponents/FormMessage.svelte';
	import { goto } from '$app/navigation';
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
    onMount(()=>{
        console.log(paymentRecordComboboxData)
        if(data.paymentRecord){
            paymentNumber = data.paymentRecord.paymentNumber
        }
    })
    let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data.searchForm, {
        onSubmit({formData}) {

        },
    });
</script>

<FormMessage message={$message} />

{#if data.paymentRecord}
    <PaymentRecord paymentRecord={data.paymentRecord} classes='p-2'/>
{/if}

{#if data.deposits}  
    {#if  data.deposits.length > 0 }        
        <Combobox 
            data={paymentRecordComboboxData}
            bind:value={selectedPayment}
            placeholder="Select deposit to refund"
            openOnClick={false}
            onValueChange={(details) =>{
                paymentNumber = parseInt(details.value[0], 10);
                goto(`/refundRecords/new?paymentNum=${paymentNumber}`)
                console.log(paymentNumber);
            }}
            classes='p-4'
        />
    {/if}
{/if}
{#if !data.paymentRecord}    
<form action="/refundRecords/new" method="POST" use:enhance>
    <TextInput
        bind:value={$form.search}
        errors={$errors.search}
        constraints={$constraints.search}
        placeholder='Enter a payment record number...'
        name='search'
        label='Payment Record number search'
    />
    <FormSubmitWithProgress delayed={$delayed} timeout={$timeout}/>
</form>
{/if}
{#if data.paymentRecord}
<NewRefundForm data={data.refundForm} paymentRecord={data.paymentRecord} classes='p-2'/>
{/if}