<script lang="ts">
	import { Combobox } from '@skeletonlabs/skeleton-svelte';
    import type { PageData } from './$types';
	import NewRefundForm from '$lib/forms/NewRefundForm.svelte';
    import { superForm } from 'sveltekit-superforms';
    import type { PaymentRecord } from '@prisma/client';
	import PaymentRecordEmployee from '$lib/displayComponents/PaymentRecordEmployee.svelte';
    import HorizontalDivider  from '$lib/displayComponents/HorizontalDivider.svelte';
    let { data }: { data: PageData } = $props();
    let selectedPayment = $state(['']);
    let paymentNumber = $state(0);
    let search = $state([''])
    interface ComboboxData {
        label: string;
        value: string;
    }
    const paymentRecordComboboxData:ComboboxData[] = [];
    const depositsWrapper = new Promise<PaymentRecord[]>(async res => {
        const deposits = await data.deposits
        if(deposits){
            res(deposits);
            deposits.forEach((deposit) => {
                const label = deposit.paymentNotes? deposit.paymentNotes : '';
                const value = deposit.paymentNumber.toString();
                paymentRecordComboboxData.push({label, value})
            })
        }

    });
    const paymentRecordsWrapper = new Promise<PaymentRecord[]>(async res => {
        const paymentRecords = await data.paymentRecords
        if(paymentRecords){
            paymentRecords.forEach((paymentRecord) => {
                const label = paymentRecord.paymentNotes ? paymentRecord.paymentNotes : '';
                const value = paymentRecord.paymentNumber.toString();
                const alreadyThere = paymentRecordComboboxData.find((datum) => datum.value === value)
                if(!alreadyThere){
                    paymentRecordComboboxData.push({label, value})
                }
            })
        }
    })
    let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data.searchForm, {
        onSubmit({formData}) {
            
        },
    });
</script>

{#if data.paymentRecord}
    <PaymentRecordEmployee paymentRecord={data.paymentRecord} classes='p-2'/>
    <HorizontalDivider />   
    <NewRefundForm data={data.refundForm} paymentRecord={data.paymentRecord} classes='p-2'/>
{/if}

