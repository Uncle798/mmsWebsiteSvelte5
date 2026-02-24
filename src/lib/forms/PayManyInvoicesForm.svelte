<script lang='ts'>
	import type { PayManyInvoicesFormSchema } from "$lib/formSchemas/payManyInvoicesFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import SuperDebug, { superForm } from "sveltekit-superforms";
	import type { Invoice } from "../../generated/prisma/browser";
   import { PaymentType } from "../../generated/prisma/browser";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import RadioButton from "$lib/formComponents/RadioButton.svelte";

   interface Props {
      data: SuperValidated<Infer<PayManyInvoicesFormSchema>>;
      customerId: string
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, customerId, modalOpen=$bindable(), classes }:Props = $props();
   // svelte-ignore state_referenced_locally
   let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data, {
      onUpdated () {
         if(!$message && !$errors){
            modalOpen = false;
         }
         if($message){
            setTimeout(() => {
               modalOpen = false;
            }, 1000)
         }
      },
   });
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/payManyInvoicesForm" method="POST" use:enhance>
      <NumberInput
         bind:value={$form.paymentAmount}
         errors={$errors.paymentAmount}
         constraints={$constraints.paymentAmount}
         name='paymentAmount'
         label='Payment amount'
      />
      <div class="flex flex-row">
         {#each Object.values(PaymentType) as paymentType}
            {#if paymentType === 'CREDIT'}
               <RadioButton
                  value={paymentType}
                  groupName='paymentType'
                  id={paymentType}
                  errors={$errors.paymentType}
                  constraints={$constraints.paymentType}
                  label={paymentType.substring(0,1)+paymentType.substring(1).toLowerCase()}
                  disabled={true}
                  onChange={(e) => {
                     if(e.currentTarget.checked){
                        $form.paymentType = paymentType;
                     }
                  }}
               />
            {:else}
               <RadioButton
                  value={paymentType}
                  groupName='paymentType'
                  id={paymentType}
                  errors={$errors.paymentType}
                  constraints={$constraints.paymentType}
                  label={paymentType.substring(0,1)+paymentType.substring(1).toLowerCase().replaceAll('_', ' ')}
                  onChange={(e) => {
                     if(e.currentTarget.checked){}{
                        $form.paymentType = paymentType
                     }
                  }}
               />
            {/if}
         {/each} 
      </div>
      <input type="hidden" name="customerId" id="customerId" value={customerId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} classes='mt-2'/>
   </form>
</div>