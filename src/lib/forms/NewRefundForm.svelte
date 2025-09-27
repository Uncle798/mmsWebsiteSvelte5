<script lang="ts">
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import type { RefundFormSchema } from "$lib/formSchemas/schemas";
   import { superForm } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import { onMount } from "svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
   import RadioButton from "$lib/formComponents/RadioButton.svelte";
	import type { PaymentRecord } from "@prisma/client";
	import PaymentRecordEmployee from "$lib/displayComponents/PaymentRecordEmployee.svelte";
	import { page } from "$app/state";
   interface Props {
      data: SuperValidated<Infer<RefundFormSchema>>;
      refundFormModalOpen?: boolean;
      paymentRecord:PaymentRecord;
      classes?: string;
   }
   let {
      data,
      refundFormModalOpen = $bindable(false),
      paymentRecord,
      classes
   }:Props = $props();
   const url = page.url.pathname
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = `${url}/newRefundForm?paymentNum=${paymentRecord.paymentNumber}:${event.path}`;
            const value = event.get(event.path);
            if(value && value !== ''){
               sessionStorage.setItem(formName, value.toString());
            }else if(value === ''){
               sessionStorage.removeItem(formName);
            }else if(value === 0){
               sessionStorage.removeItem(formName);
            }
         }
      },
      onSubmit(input) {
      }, 
      onUpdate(){
         refundFormModalOpen = false;
      }
   });
   onMount(()=>{
      $form.amount = paymentRecord.paymentAmount;
      $form.notes = `Refund of payment record number: ${paymentRecord.paymentNumber}, ${paymentRecord.paymentNotes}`
      for(const key in $form){
         let fullKey = `${url}/newRefundForm?paymentNum=${paymentRecord.paymentNumber}:${key}`;
         const storedValue = sessionStorage.getItem(fullKey)
         if(storedValue){
            if(isNaN(parseInt(storedValue, 10))){
               if(storedValue === 'true'){
                  $form[key as keyof typeof $form] = true as never;
               } else if(storedValue === 'false'){
                  $form[key as keyof typeof $form] = false as never;
               } else {
                  $form[key as keyof typeof $form] = storedValue as never;
               }
            } else {
               $form[key as keyof typeof $form] = parseInt(storedValue, 10) as never;
            }
         }
      }
   })
   const paymentTypes = [ 'CASH', 'CHECK', 'CREDIT'];
</script>
<div class="{classes} flex flex-col gap-2">
   <FormMessage message={$message} />
   <form action="/forms/newRefundForm" method="POST" use:enhance>
      <TextArea 
         bind:value={$form.notes}
         errors={$errors.notes}
         constraints={$constraints.notes}
         rows={5}
         label='Refund Notes'
         name='notes'
      />
      <NumberInput
         bind:value={$form.amount}
         errors={$errors.amount}
         constraints={$constraints.amount}
         label='Refund amount'
         name='amount'
      />
      <div class="flex">
         {#each paymentTypes as paymentType}
            <RadioButton
               value={paymentType}
               groupName='refundType'
               id={paymentType}
               errors={$errors.refundType}
               constraints={$constraints.refundType}
               label={paymentType.substring(0,1)+paymentType.substring(1).toLowerCase()}
            />
         {/each}
      </div>
      <input type="hidden" name="paymentRecordNumber" value={paymentRecord.paymentNumber}>
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="Submit Refund"/>
   </form>
</div>