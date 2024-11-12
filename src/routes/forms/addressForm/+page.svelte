<script lang="ts">
   import { superForm,} from 'sveltekit-superforms';
   import TextInput from '$lib/formComponents/textInput.svelte';
	import { Progress, ProgressRing } from '@skeletonlabs/skeleton-svelte';

   let {data, addressModalOpen=$bindable(false)}: {
      data:{
         address1: string;
         city: string;
         state: string;
         zip: string;

      }, 
      addressModalOpen:boolean,
      } = $props();
   let { form, message, errors, constraints, enhance, delayed, timeout} = superForm(data, {
      onUpdate() {
         addressModalOpen=false;
      },
      dataType:'json',
      delayMs: 500,
      timeoutMs: 8000,
      invalidateAll: 'force'
   });
</script>

<span class="h2">Update your address</span>
{#if $message}
   <span>{$message} </span>
{/if}
<form action='/' method='POST' use:enhance>
    <TextInput
      bind:value={$form.address1}
      errors={$errors.address1}
      constraints={$constraints.address1}
      label='Line 1'
      name='address1'
      placeholder='1700 Mill Road'
    />
    <div class="flex">
    <TextInput
        label='City'
        name='city'
        bind:value={$form.city}
        errors={$errors.city}
        constraints={$constraints.city}
        placeholder='Moscow'
    />
    <TextInput
        label='State'
        name='state'
        bind:value={$form.state}
        errors={$errors.state}
        constraints={$constraints.state}
        placeholder='ID'
    />
    <TextInput
        label='Zip Code'
        name='zip'
        bind:value={$form.zip}
        errors={$errors.zip}
        constraints={$constraints.zip}
        placeholder='83843'
    />
   <button class="btn">Submit</button>
   {#if $delayed && !$timeout}
      <ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400" trackStroke="stroke-tertiary-50-950" />
   {/if}
   {#if $timeout}
      <Progress value={null} />
   {/if}
</form>