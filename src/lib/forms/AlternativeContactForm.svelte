<script lang='ts'>
	import type { AlternativeContactFormSchema } from "$lib/formSchemas/alternativeContactFormSchema";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";


   interface Props {
      data: SuperValidated<Infer<AlternativeContactFormSchema>>;
      
      classes?: string;
   }
   let { data, classes }:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout } = superForm(data)
</script>