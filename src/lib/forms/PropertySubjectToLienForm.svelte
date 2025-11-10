<script lang="ts">
   import type { AddressFormSchema } from '$lib/formSchemas/addressFormSchema';
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import TextArea from "$lib/formComponents/TextArea.svelte";
	import type { PropertySubjectToLienSchema } from '$lib/formSchemas/propertySubjectToLienSchema';


   interface Props {
      data: SuperValidated<Infer<PropertySubjectToLienSchema>>;
      addressFormData: SuperValidated<Infer<AddressFormSchema>>;
      classes?: string;
   }
   let { data, classes}:Props = $props();
   let { form, errors, constraints, enhance, delayed, timeout } = superForm(data)
</script>

<div class={classes}>
   <form action="/forms/propertySubjectToLienForm" method="POST">\   
      <TextArea
         value={$form.description}
         label='Property Description'
         name='description'
         errors={$errors.description}
         constraints={$constraints.description}
      />
   </form>
</div>