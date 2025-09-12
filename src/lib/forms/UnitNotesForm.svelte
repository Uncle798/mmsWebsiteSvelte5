<script lang='ts'>
   import { superForm } from "sveltekit-superforms";
	import type { UnitNotesFormSchema } from "$lib/formSchemas/schemas";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import { Switch } from "@skeletonlabs/skeleton-svelte";
	import { onMount } from "svelte";
	import type { Unit } from "@prisma/client";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import { invalidateAll } from "$app/navigation";

   
   interface Props {
      data: SuperValidated<Infer<UnitNotesFormSchema>>
      unitNotesFormModalOpen?: boolean
      unit:Unit
      classes?: string;
   }
   let { data, unitNotesFormModalOpen, unit, classes }:Props = $props();

   let { form, message, errors, constraints, enhance, delayed, timeout, submit } = superForm(data, {
      onChange(event) {
         if(event.target){
            const formName = 'unitNotesForm'
            const value = event.get(event.path);
            if(value){
               sessionStorage.setItem(`${formName}:${event.path}`, value.toString());
            }
         }
      },
      id:unit.num.toString(),
      onUpdated(){
         unitNotesFormModalOpen=false;
      },
   })
   onMount(()=>{
      $form.unavailable = unit.unavailable;
      $form.notes = unit.notes;
      for(const key in $form){
         let fullKey = `unitNotesForm:${key}`;
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
<div class="{classes} flex flex-col">
   <FormMessage message={$message} />
   <form action="/forms/unitNotesForm" method="POST" use:enhance>
      <TextArea
         bind:value={$form.notes}
         errors={$errors.notes}
         constraints={$constraints.notes}
         label='Notes'
         name='notes'
      />
      <div class="flex flex-col sm:flex-row">
         <Switch 
            checked={$form.unavailable}
            onCheckedChange={(e)=> {
               $form.unavailable = e.checked;
               submit()
               invalidateAll()
            }}
            name='unavailable'  
            classes='m-2'
         >
            Unit is unavailable
         </Switch>
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Update notes'/>
      </div>
      <input type="hidden" name="unitNum" id="unitNum" value={unit.num} />
   </form>
</div>