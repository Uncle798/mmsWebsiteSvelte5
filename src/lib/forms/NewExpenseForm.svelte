<script lang='ts'>
	import type { NewExpenseFormSchema } from "$lib/formSchemas/newExpenseFormSchema";
	import type { Infer, SuperValidated } from "sveltekit-superforms";

   interface Props {
      data: SuperValidated<Infer<NewExpenseFormSchema>>;
      
   }
   let { data }:Props = $props()
   
</script>