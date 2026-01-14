<script lang='ts'>
   import { superForm, type SuperValidated, type Infer } from "sveltekit-superforms";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import type { EmploymentFormSchema } from "$lib/formSchemas/employmentFormSchema";
	import Switch from "$lib/formComponents/Switch.svelte"
	import type { User } from "../../generated/prisma/client";

   interface Props {
      data: SuperValidated<Infer<EmploymentFormSchema>>;
      user: User;
      classes?: string;
      modalOpen?: boolean;
   }
   let { data, user, classes, modalOpen=$bindable() }:Props = $props();
   // svelte-ignore state_referenced_locally
   let { form, message, enhance, delayed, timeout, submit, } = superForm(data, {
      onUpdated(){
         if($message){
            setTimeout(() => {
               modalOpen = false
            }, 1500)
         }
      }
   });
</script>
<div class="{classes}">
   {#if $message}
      <FormMessage message={$message} />
   {:else}
      <div class="h-8"></div>
   {/if}
   <form action="/forms/employmentChangeForm" method="POST" use:enhance >
      <div class="gap-4"> 
         <Switch 
            name='employee' 
            checked={user.employee} 
            label='Employee' 
            onCheckedChange={(e) => {
               $form.employee = e.checked; 
               submit();
            }}
         />
         <Switch 
            name='admin' 
            checked={user.admin} 
            label='Admin' 
            onCheckedChange={(e) => {
               $form.admin = e.checked;
               submit();
            }}
         />
      </div>
      <input type="hidden" name='userId' value={user.id} />
   </form>
</div>