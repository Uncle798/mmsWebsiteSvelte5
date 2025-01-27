<script lang="ts">
	import DateInput from "$lib/formComponents/DateInput.svelte";
	import type { DateSearchFormSchema } from "$lib/formSchemas/schemas";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";


   interface Props {
      data: SuperValidated<Infer<DateSearchFormSchema>>;
      startDate: Date | undefined;
      endDate: Date | undefined;
   }
   let { data, startDate=$bindable(), endDate=$bindable() }:Props = $props();

   let { form, message, enhance, constraints, errors } = superForm(data, {
      onChange(event) {
         startDate = event.get('startDate')
         endDate = event.get('endDate')
      },
   })
</script>

<form method="POST" use:enhance>
   <div class="flex">
      <div>
         <DateInput
            bind:value={$form.startDate}
            errors={$errors.startDate}
            constraints={$constraints.startDate}
            label='Start date'
            name='startDate'
         />
         <button class="btn" type="button" onclick={()=>{ $form.startDate=undefined; startDate=undefined}}>Clear start date</button>
      </div>
      <div>
         <DateInput
            bind:value={$form.endDate}
            errors={$errors.endDate}
            constraints={$constraints.endDate}
            label='End date'
            name='endDate'
         />
         <button class="btn" type="button" onclick={()=>{ $form.endDate=undefined; endDate=undefined}}>Clear end date</button>
      </div>
   </div>
</form>