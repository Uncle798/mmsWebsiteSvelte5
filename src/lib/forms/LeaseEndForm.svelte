<script lang='ts'>
   import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import { endLeaseSchema, type EndLeaseSchema } from "$lib/formSchemas/schemas";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   interface Props{
      data: SuperValidated<Infer<EndLeaseSchema>>;
      leaseId: string;
      leaseEndModalOpen: boolean
   }

   let {data, leaseEndModalOpen=$bindable(false), leaseId}:Props = $props()
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdated(){
         leaseEndModalOpen = false;
      },
      warnings:{
         duplicateId: false,
      }
   });
</script>

<FormMessage message={$message} />
<form action="/forms/leaseEndForm " method="POST" use:enhance>
   <input type="hidden" name="leaseId" id="leaseId" value={leaseId}>
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="I'm sure I've cleaned out the unit"/>
</form>