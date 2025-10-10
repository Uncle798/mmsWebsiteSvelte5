<script lang='ts'>
   import { superForm, type SuperValidated, type Infer } from "sveltekit-superforms";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import type { EmploymentFormSchema } from "$lib/formSchemas/schemas";
	import Switch from "$lib/formComponents/Switch.svelte"

   interface Props {
      data: SuperValidated<Infer<EmploymentFormSchema>>;
      employeeChecked: boolean;
      adminChecked: boolean;
      userId: string;
      classes?: string;
   }
   let { data,  employeeChecked=$bindable(false), adminChecked=$bindable(false), userId, classes }:Props = $props();
   let { message, enhance, delayed, timeout, } = superForm(data, {

      warnings:{
         duplicateId: false
      }
   });
</script>
<div class="my-2 {classes}">
   <FormMessage message={$message} />
   <form action="/forms/employmentChangeForm" method="POST" use:enhance>
      <Switch name='employee' checked={employeeChecked} label='Employee'/>
      <Switch name='admin' checked={adminChecked} label='Admin'/>
      <input type="hidden" name='userId' value={userId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="Change employment status"/>
   </form>
</div>