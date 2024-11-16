<script lang="ts">
    import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";  
    import TextInput from '$lib/formComponents/textInput.svelte';
    import type { EmailVerificationFormSchema } from "$lib/formSchemas/schemas";
	import FormProgress from "$lib/formComponents/FormProgress.svelte";
    import { invalidateAll } from "$app/navigation";
	import FormMessage from "$lib/formComponents/FormMessage.svelte";
    
    let {data, emailVerificationOpen=$bindable(true)}: {data:SuperValidated<Infer<EmailVerificationFormSchema>>, emailVerificationOpen:boolean} = $props();
    let { form, errors, constraints, message, enhance, submitting, delayed, timeout } = superForm(data, {
        onUpdated(){
            emailVerificationOpen=false;
            invalidateAll();
        },
        
    });
</script>

<FormMessage message={$message} />
<form method="POST" action="/register/emailVerification?/verify" use:enhance>
    <TextInput
        label="Code: "
        name="code"
        bind:value={$form.code}
        errors={$errors.code}
        constraints={$constraints.code}
        placeholder='12345678'
    />
    <div class="flex">
        <button class="btn">Submit</button>
        <FormProgress delayed={$delayed} timeout={$timeout}/>
    </div>
</form>

<form method="POST" action="/register/emailVerification?/resend" >
    <button class="btn">Resend email</button>
</form>