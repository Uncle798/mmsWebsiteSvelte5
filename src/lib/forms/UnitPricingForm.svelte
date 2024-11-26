<script lang='ts'>
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import type { UnitPricingFormSchema } from '$lib/formSchemas/schemas'
   import { superForm } from "sveltekit-superforms";
   import { invalidateAll } from "$app/navigation";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
	import { Switch } from "@skeletonlabs/skeleton-svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";

   interface Props {
      data: SuperValidated<Infer<UnitPricingFormSchema>>
      unitPricingFormModalOpen?: boolean
      size: string
   }
   let { data, unitPricingFormModalOpen=$bindable(false), size} = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdated(){
         unitPricingFormModalOpen=false;
         invalidateAll();
      },   
   })
</script>

<FormMessage message={$message} />

<form action="/forms/unitPricingForm" method="POST" use:enhance>
   <NumberInput
      bind:value={$form.price}
      errors={$errors.price}
      constraints={$constraints.price}
      label='Price'
      name='price'
   />
   <Switch
      bind:checked={$form.lowerPrice}
      name="lowerPrice"
      label='Lower Price'>
      Lower the price.
   </Switch>
   <input type="hidden" name="size" id="size" value={size}>
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
</form>