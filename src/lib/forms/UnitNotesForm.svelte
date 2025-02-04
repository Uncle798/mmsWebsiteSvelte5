<script lang='ts'>
   import { superForm } from "sveltekit-superforms";
	import type { UnitNotesFormSchema } from "$lib/formSchemas/schemas";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import { Switch } from "@skeletonlabs/skeleton-svelte";
	import { invalidateAll } from "$app/navigation";
	import { onMount } from "svelte";
	import type { Unit } from "@prisma/client";

   
   interface Props {
      data: SuperValidated<Infer<UnitNotesFormSchema>>
      unitNotesFormModalOpen?: boolean
      unit:Unit
      classes: string;
   }
   let { data, unitNotesFormModalOpen, unit, classes }:Props = $props();

   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onChange(event) {
      
      },
      multipleSubmits: 'allow',
      onUpdated(){
         unitNotesFormModalOpen=false;
         invalidateAll();
      },
      warnings: {
         duplicateId: false
      } 
   })
   onMount(()=>{
      $form.notes = unit.notes
   })
</script>
<div class="{classes} flex flex-col">
   <FormMessage message={$message} />
   <form action="/forms/unitNotesForm" method="POST" use:enhance>
      <TextInput
         bind:value={$form.notes}
         errors={$errors.notes}
         constraints={$constraints.notes}
         label='Notes'
         name='notes'
      />
      <Switch 
         bind:checked={unit.unavailable}
         name='unavailable'  
         classes='p-4'
      >
         Unit is unavailable
      </Switch>
      <input type="hidden" name="unitNum" id="unitNum" value={unit.num} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Update notes'/>
   </form>
</div>