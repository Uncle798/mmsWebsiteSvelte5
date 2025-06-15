<script lang='ts'>
   import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
   import type { LeaseEndFormSchema } from "$lib/formSchemas/schemas";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import { invalidateAll } from "$app/navigation";
   interface Props{
      data: SuperValidated<Infer<LeaseEndFormSchema>>;
      leaseId: string;
      customer?: boolean;
      leaseEndModalOpen?: boolean;
      classes?: string;
   }

   let {data, leaseEndModalOpen=$bindable(false), leaseId, customer, classes}:Props = $props()
   let { message, enhance, delayed, timeout} = superForm(data, {
      onUpdate(){
         leaseEndModalOpen = false;
         invalidateAll();
      },
      warnings:{
         duplicateId: false,
      },
   });
</script>

<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/leaseEndForm " method="POST" use:enhance>
      <input type="hidden" name="leaseId" id="leaseId" value={leaseId}>
      <input type="hidden" name="customer" id="customer" value={customer}>
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="I'm sure I've cleaned out the unit"/>
   </form>
</div>