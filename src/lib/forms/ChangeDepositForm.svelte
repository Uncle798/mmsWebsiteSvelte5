<script lang="ts">
   import { superForm } from "sveltekit-superforms";
	import type { ChangeDepositFormSchema } from "$lib/formSchemas/changeDepositFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import type { Unit } from "../../generated/prisma/browser";
	import Switch from "$lib/formComponents/Switch.svelte";

   interface Props {
      data: SuperValidated<Infer<ChangeDepositFormSchema>>;
      unit: Unit;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, unit, modalOpen=$bindable(), classes }:Props = $props();
   // svelte-ignore state_referenced_locally
   let { form, message, errors, constraints, enhance, delayed, timeout, capture, restore, } = superForm(data, {
      onChange(event) {
      },
      onSubmit({formData}) {

      },
      onUpdated() {
         if(!$message || !$errors){
            modalOpen=false;
         }
      },
      delayMs: 500,
      timeoutMs: 8000,
   });
   export const snapshot = {
      capture,
      restore,
   }
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/changeDepositForm" method="POST" use:enhance>
      <NumberInput
         value={$form.depositAmount}
         label='New deposit amount'
         name='depositAmount'
         errors={$errors.depositAmount}
         constraints={$constraints.depositAmount}
      />
      <Switch
         checked={$form.changeAll}
         onCheckedChange={(e) => {
            $form.changeAll = e.checked
         }}
         label='Change all {unit.size.replace(/^0+/gm, '').replace(/x0/gm, '')} deposits?'
         name='changeAll'
      />
      <input type="hidden" value={unit.num} name='unitNum'/>
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>