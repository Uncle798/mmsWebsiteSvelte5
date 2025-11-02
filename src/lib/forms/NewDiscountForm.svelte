<script lang="ts">
	import type { NewDiscountFormSchema } from "$lib/formSchemas/schemas";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import NumberInput from "$lib/formComponents/NumberInput.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import Switch from "$lib/formComponents/Switch.svelte";
	import { onMount } from "svelte";
   interface Props {
      data: SuperValidated<Infer<NewDiscountFormSchema>>;
      classes?: string;
   }
   let { data, classes }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = 'newDiscountForm'
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${formName}:${event.path}`, value.toString());
            }
         }
      },
   });
   onMount(() => {
      for(const key in $form){
         const fullKey = `newDiscountForm:${key}`;
         const storedValue = sessionStorage.getItem(fullKey);
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
   <form action='/forms/newDiscountForm' method="POST" use:enhance >
      <TextInput
         bind:value={$form.code}
         errors={$errors.code}
         constraints={$constraints.code}
         label='Code (Case Sensitive, must be at least 8 characters)'
         name='code'
         placeholder='NonProfit10'
      />
      <NumberInput
         bind:value={$form.amountOff}
         errors={$errors.amountOff}
         constraints={$constraints.amountOff}
         label='Discount amount'
         name='amountOff'
      />
      <Switch 
         checked={$form.percentage}
         onCheckedChange={(e)=>$form.percentage=e.checked}
         name='percentage'
         label='Percentage'
      />
      <TextInput
         bind:value={$form.notes}
         errors={$errors.notes}
         constraints={$constraints.notes}
         label='Notes'
         name='notes'
         placeholder='For any non-profits'
      />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Make discount'/>
   </form>
</div>