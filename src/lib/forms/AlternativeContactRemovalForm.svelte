<script lang='ts'>
   import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
	import { invalidateAll } from "$app/navigation";
	import type { AlternativeContactRemovalFormSchema } from "$lib/formSchemas/alternativeContactRemovalFormSchema";
   
   interface Props{
      data: SuperValidated<Infer<AlternativeContactRemovalFormSchema>>;
      alternativeContactId: string;
      modalOpen?: boolean;
      classes?: string;
   }

   let { data, modalOpen=$bindable(false), alternativeContactId, classes }:Props = $props()
   let { message, enhance, delayed, timeout } = superForm(data, {
      onUpdate(){
         modalOpen = false;
         invalidateAll();
      },
      warnings:{
         duplicateId: false,
      },
   });
</script>

<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/alternativeContactRemovalForm " method="POST" use:enhance>
      <input type="hidden" name="alternativeContactId" id="alternativeContactId" value={alternativeContactId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="I'm sure I want to delete this contact"/>
   </form>
</div>