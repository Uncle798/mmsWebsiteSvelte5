<script lang='ts'>
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import TextInput from "$lib/formComponents/TextInput.svelte";
import type { NewVendorFormSchema } from "$lib/formSchemas/newVendorFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";
   interface Props {
      data: SuperValidated<Infer<NewVendorFormSchema>>;
      modalOpen?: boolean;
      classes?: string;
   }
   let { data, modalOpen=$bindable(), classes }:Props = $props();
     // svelte-ignore state_referenced_locally
   let { form, errors, message, constraints, enhance, delayed, timeout, } = superForm(data, {
      onUpdated() {
         if(!$message && !$errors){
            modalOpen = false;
         }
      }
   });
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/newVendorForm" method="POST" use:enhance>
      <TextInput
         value={$form.organizationName}
         errors={$errors.organizationName}
         constraints={$constraints.organizationName}
         label='Organization name'
         name='organizationName'
         placeholder='Organization name'
      />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} />
   </form>
</div>