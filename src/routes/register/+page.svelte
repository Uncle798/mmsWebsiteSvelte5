<script lang="ts">
   import { superForm } from "sveltekit-superforms";  
	import type { PageData } from "./$types";

	import Header from "$lib/Header.svelte";
	import { fade } from "svelte/transition";
	import RegisterForm from "$lib/forms/RegisterForm.svelte";
   interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const { form, errors, constraints, message, enhance, delayed, timeout } = superForm(data.registerForm)

</script>
<Header title='Register a new account' />
<div class="m-2" transition:fade={{duration:600}}>
   <RegisterForm data={data.registerForm} formType='customer'/>
   <a href="/login?redirectTo={data.redirectTo}&unitNum={data.unitNum}" class="anchor">Already have an account? Login here.</a>
</div>