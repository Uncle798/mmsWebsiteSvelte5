<script lang='ts'>
   import { superForm, type SuperValidated, type Infer } from "sveltekit-superforms";
   import FormMessage from "$lib/formComponents/FormMessage.svelte";
   import FormSubmitWithProgress from "$lib/formComponents/FormSubmitWithProgress.svelte";
   import type { EmploymentFormSchema } from "$lib/formSchemas/employmentFormSchema";
	import Switch from "$lib/formComponents/Switch.svelte"

   interface Props {
      data: SuperValidated<Infer<EmploymentFormSchema>>;
      employeeChecked: boolean;
      adminChecked: boolean;
      userId: string;
      classes?: string;
   }
   let { data,  employeeChecked=$bindable(false), adminChecked=$bindable(false), userId, classes }:Props = $props();
   let { form, message, enhance, delayed, timeout, submit, } = superForm(data, {
      id: userId,
      onSubmit: (input) => {
         console.log(input.formData)
      }
   });
</script>
<div class="my-2 {classes}">
   <FormMessage message={$message} />
   <form action="/forms/employmentChangeForm" method="POST" use:enhance>
      <Switch 
         name='employee' 
         checked={employeeChecked} 
         label='Employee' 
         onCheckedChange={(e) => {
            employeeChecked = e.checked;
            $form.employee = e.checked; 
            submit();
         }}
      />
      <Switch 
         name='admin' 
         checked={adminChecked} 
         label='Admin' 
         onCheckedChange={(e) => {
            adminChecked = e.checked; 
            employeeChecked = e.checked;
            $form.admin = e.checked;
            $form.employee = e.checked;
            submit();
         }}
      />
      <input type="hidden" name='userId' value={userId} />
      <FormSubmitWithProgress delayed={$delayed} timeout={$timeout} buttonText="Change employment status"/>
   </form>
</div>