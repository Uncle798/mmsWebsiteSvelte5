<script lang='ts'>
   import { superForm, type SuperValidated, type Infer } from "sveltekit-superforms";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import type { EmploymentFormSchema } from "$lib/formSchemas/schemas";
	import { Switch } from "@skeletonlabs/skeleton-svelte";

   interface Props {
      data: SuperValidated<Infer<EmploymentFormSchema>>;
      employeeChecked: boolean;
      adminChecked: boolean;
      userId: string
   }
   let { data,  employeeChecked=$bindable(false), adminChecked=$bindable(false), userId}:Props = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data);
</script>
<div class="card p-4">
   <FormMessage message={$message} />
   <form action="/forms/employmentChangeForm" method="POST" use:enhance>
      <Switch name='employee' bind:checked={employeeChecked}>Employee</Switch>
      <Switch name='admin' bind:checked={adminChecked}>Admin</Switch>
      <input type="hidden" name='userId' value={userId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="Change employment status"/>

   </form>
</div>