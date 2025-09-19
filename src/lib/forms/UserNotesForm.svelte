<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import type { UserNotesFormSchema } from "$lib/formSchemas/schemas";
	import type { User } from "@prisma/client";
	import { Switch } from "@skeletonlabs/skeleton-svelte";
	import { onMount } from "svelte";
	import { superForm, type SuperValidated, type Infer } from "sveltekit-superforms";


   interface Props {
      data: SuperValidated<Infer<UserNotesFormSchema>>;
      userNotesFormModalOpen?: boolean;
      user: User;
      classes?: string;
   }
   let { data, userNotesFormModalOpen=$bindable(), user, classes }:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout, submit } = superForm(data, {
      onUpdated(){
         userNotesFormModalOpen = false;
      }
   })
   onMount(() => {
      $form.doNotRent = user.doNotRent;
      $form.notes = user.customerNotes;
      for(const key in $form){
         let fullKey = `userNotesForm:${key}`;
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
   <form action="/forms/userNotesForm" method="POST" use:enhance>
      <TextArea
         bind:value={$form.notes}
         errors={$errors.notes}
         constraints={$constraints.notes}
         label='Notes'
         name='notes'
      />
      <div>
         <Switch
            checked={$form.doNotRent}
            onCheckedChange={(e) => {
               $form.doNotRent = e.checked;
               submit();
            }}
            name='doNotRent'
            classes='m-2'
         >
            Do not Rent to {user.organizationName ? user.organizationName : `${user.givenName} ${user.familyName}`}
         </Switch>
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Update notes'/>
      </div>
      <input type="hidden" name="userId" id="userId" value={user.id}>
   </form>
</div>