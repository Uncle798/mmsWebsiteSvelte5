<script lang="ts">
    import UnitEmployee from '$lib/displayComponents/UnitEmployee.svelte';
    import { Combobox, Modal } from '@skeletonlabs/skeleton-svelte';
    import { superForm } from 'sveltekit-superforms';
    import User from '$lib/displayComponents/User.svelte';
    import RegisterForm from '$lib/forms/RegisterForm.svelte';
    import Header from '$lib/Header.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    interface ComboBoxData {
      label: string;
      value: string;
    } 
    let { form, errors, message, constraints, enhance, delayed, timeout} = superForm(data.leaseForm, {

   });

</script>


<Header title="Employee New Lease" />

<RegisterForm data={data.registerForm} formType=employee/>
