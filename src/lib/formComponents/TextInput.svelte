<script lang="ts">
	import type { FullAutoFill } from 'svelte/elements';
   import type { InputConstraint } from 'sveltekit-superforms';
   
   interface Props {
      value:string | undefined | null;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      placeholder?:string | undefined;
      name: string | null | undefined;
      autocomplete?: FullAutoFill;
   }
   let { value = $bindable(), label, errors, constraints, placeholder, name, autocomplete,...others }:Props = $props()
</script>
<div class="p-4">
<label class="label">
   {#if label}<span class="label-text">{label}</span><br />{/if}
   <input
      type="text"
      class="input"
      name={name}
      bind:value={value}
      aria-invalid={errors ? 'true' : undefined}
      placeholder={placeholder}
      autocomplete={autocomplete}
      {...constraints}
      {...others}
   />
 </label>
 {#if errors}<span class="invalid">{errors}</span>{/if}
</div>