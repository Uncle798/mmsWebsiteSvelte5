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
	import { browser } from "$app/environment";

   interface Props {
      data: SuperValidated<Infer<UnitPricingFormSchema>>;
      unitPricingFormModalOpen?: boolean;
      size: string;
      oldPrice: number;
      classes?: string;
   }
   let { data, unitPricingFormModalOpen=$bindable(false), size, oldPrice, classes}:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = 'unitPricingForm'
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${formName}:${event.path}`, value.toString());
            }
         }
      },
      onUpdated(){
         unitPricingFormModalOpen=false;
         invalidateAll();
      }, 
      warnings: {
         duplicateId: false
      }
   })
   onMount(()=>{
      $form.price = oldPrice;
      for(const key in $form){
         let fullKey = `unitPricingForm:${key}`;
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
         placeholder={oldPrice.toString()}
      />
      <Switch
         checked={$form.changeDeposit}
         onCheckedChange={(e)=> $form.changeDeposit = e.checked}
         name='changeDeposit'
         classes='my-2'
      >
         Change the deposit as well
      </Switch>
      <Switch
         checked={$form.lowerPrice}
         onCheckedChange={(e)=> $form.lowerPrice = e.checked}
         name="lowerPrice"
         label='Lower Price'
      >
         Lower the price.
      </Switch>
      <input type="hidden" name="size" id="size" value={size}>
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Submit new price'/>
   </form>
</div>