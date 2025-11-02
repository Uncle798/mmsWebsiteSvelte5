<script lang='ts'>
   import { superForm } from "sveltekit-superforms";
	import type { UnitNotesFormSchema } from "$lib/formSchemas/schemas";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import Switch from "$lib/formComponents/Switch.svelte";
	import { onMount } from "svelte";
	import type { Unit } from "@prisma/client";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import { page } from "$app/state";

   interface Props {
      data: SuperValidated<Infer<UnitNotesFormSchema>>
      unitNotesFormModalOpen?: boolean
      unit:Unit
      classes?: string;
   }
   let { data, unitNotesFormModalOpen, unit, classes }:Props = $props();
   const id = $props.id();
   const url = page.url.pathname;
   let { form, message, errors, constraints, enhance, delayed, timeout, submit } = superForm(data, {
      onChange(event) {
         console.log(event);
         if(event.target){
            if(event.path === 'notes'){
               const formName = `${url}/unitNotesForm${unit.num.toString()}`
               const value = event.get(event.path);
               if(value){
                  sessionStorage.setItem(`${formName}:${event.path}`, value.toString());
               } else {
                  sessionStorage.removeItem(`${formName}:${event.path}`)
               }
            }
         }
      },
      id:unit.num.toString(),
      onUpdated(){
         unitNotesFormModalOpen=false;
      },
      invalidateAll: 'force'
   })
   onMount(()=>{
      $form.unavailable = unit.unavailable;
      $form.notes = unit.notes;
      for(const key in $form){
         if(key === 'notes'){
            let fullKey = `${url}/unitNotesForm${unit.num.toString()}:${key}`;
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
      <div class="flex flex-col sm:flex-row gap-2 mt-2 justify-center">
         <Switch 
            bind:checked={$form.unavailable}
            name='unavailable'
            label='Unit is Unavailable'
            onCheckedChange = {(e) => {
               $form.unavailable = e.checked;
               submit()
            }}
         />
         <input type="hidden" name="unitNum" id="unitNum" value={unit.num} />
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Update notes'/>
      </div>
   </form>
</div>