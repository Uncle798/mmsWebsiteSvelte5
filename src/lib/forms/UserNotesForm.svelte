<script lang="ts">
	import { page } from "$app/state";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import type { UserNotesFormSchema } from "$lib/formSchemas/userNotesFormSchema";
	import type { User } from "../../generated/prisma/browser";
	import Switch from "$lib/formComponents/Switch.svelte";
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
      },
      id: user.id,
      invalidateAll:'force'
   })
   const url = page.url.pathname
   onMount(() => {
      $form.doNotRent = user.doNotRent;
      $form.notes = user.customerNotes;
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
      <div class="flex flex-row gap-2">
         <Switch
            checked={$form.doNotRent}
            name='doNotRent'
            label='Do not Rent to {user.organizationName ? user.organizationName : `${user.givenName} ${user.familyName}`}'
         />
         <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Update notes'/>
      </div>
      <input type="hidden" name="userId" id="userId" value={user.id}>
   </form>
</div>