<script lang='ts'>
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import type { UnitPricingFormSchema } from '$lib/formSchemas/schemas'
   import { superForm } from "sveltekit-superforms";
   import { invalidateAll } from "$app/navigation";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import { Switch } from "@skeletonlabs/skeleton-svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import { onMount } from "svelte";

   interface Props {
      data: SuperValidated<Infer<UnitPricingFormSchema>>;
      unitPricingFormModalOpen?: boolean;
      size: string;
      oldPrice: number;
      classes?: string;
   }
   let { data, unitPricingFormModalOpen=$bindable(false), size, oldPrice, classes}:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdated(){
         unitPricingFormModalOpen=false;
         invalidateAll();
      }, 
      warnings: {
         duplicateId: false
      }
   })
   onMount(()=>{
      $form.price = oldPrice
   })
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/unitPricingForm" method="POST" use:enhance>
      <p class="">Change all {size.replace(/^0+/gm,'').replace(/x0/gm,'x')} units from ${oldPrice} to </p>
      <NumberInput
         bind:value={$form.price}
         errors={$errors.price}
         constraints={$constraints.price}
         label='New price $'
         name='price'
         classes='w-32'
      />
      <Switch
         bind:checked={$form.changeDeposit}
         name='changeDeposit'
         classes='my-2'
      >
         Change the deposit as well
      </Switch>

      <Switch
         bind:checked={$form.lowerPrice}
         name="lowerPrice"
         label='Lower Price'>
         Lower the price.
      </Switch>
      <input type="hidden" name="size" id="size" value={size}>
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Submit new price'/>
   </form>
</div>