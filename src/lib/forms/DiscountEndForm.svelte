<script lang='ts'>
	import { invalidateAll } from "$app/navigation";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import type { CuidIdFormSchema } from '$lib/formSchemas/cuidIdFormSchema';
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<CuidIdFormSchema>>;
      discountId: string | undefined;
      classes?: string;
   }
   let { data, discountId, classes }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate(event) {
         invalidateAll();
      },
      warnings: {
         duplicateId: false
      },
   });
</script>
<div class={classes}>
   <FormMessage message={$message} />
   <form action="/forms/discountEndForm" method="POST" use:enhance>
      <input type='hidden' name="cuid2Id" value={discountId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='End this discount'/>
   </form>
</div>