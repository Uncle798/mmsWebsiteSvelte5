<script lang='ts'>
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
	import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
import type { DiscountEndFormSchema } from "$lib/formSchemas/schemas";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
   import { superForm } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<DiscountEndFormSchema>>;
      discountId: string | undefined;
   }
   let { data, discountId }:Props = $props();
   let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate(){
      }
   });
</script>
<FormMessage message={$message} />
<form action="/forms/discountEndForm" method="POST" use:enhance>
   <input type='hidden' name="discountId" value={discountId} />
   <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText='End this discount'/>
</form>