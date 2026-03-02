<script lang="ts">
	import { goto } from "$app/navigation";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
	import type { LeaseDeleteFormSchema } from "$lib/formSchemas/leaseDeleteFormSchema";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import type { Lease } from "../../generated/prisma/browser";
	import { leaseChangeFormSchema } from "$lib/formSchemas/leaseChangeFormSchema";

   interface Props {
      data: SuperValidated<Infer<LeaseDeleteFormSchema>>;
      lease: Lease;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, lease, modalOpen=$bindable(), classes, }:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data, {
      onUpdated(event) {
         if(event.form.valid && !$message){
            modalOpen = false;
         }
         if(event.form.valid && $message === 'Lease deleted'){
            setTimeout(() => {
               modalOpen = false;
               goto('/leases');
            }, 1000);
         }
      },
   });
</script>
<div class='{classes}'>
   <FormMessage message={$message} />
   <form action="/forms/leaseDeleteForm" method="POST" use:enhance>
      <TextInput
         value={$form.confirm}
         errors={$errors.confirm}
         constraints={$constraints.confirm}
         label='Enter the lease ID'
         name='confirm'
      />
      <input type="hidden" value={lease.leaseId} name="leaseId"/>
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='Delete lease' classes='my-2'/>
   </form>
</div>