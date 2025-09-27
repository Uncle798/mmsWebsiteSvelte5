<script lang="ts">
	import type { FullAutoFill } from 'svelte/elements';
   import type { InputConstraint } from 'sveltekit-superforms';
   
   interface Props {
      value:string | null | undefined;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      placeholder?:string | undefined;
      name: string | null | undefined;
      autocomplete?: FullAutoFill;
      classes?: string;
      rows?: number | null;
   }
   let { value = $bindable(), label, errors, constraints, placeholder, name, autocomplete, rows, ...others }:Props = $props()
</script>
<div class="">
   
   <label class="label ">
      {#if label}
         <span class="label-text">{label}</span>
      {/if}
      <textarea
         class="input rounded-none"
         rows={rows}
         name={name}
         aria-invalid={errors ? 'true' : undefined}
         placeholder={placeholder}
         autocomplete={autocomplete}
         value={value}
         {...constraints}
         {...others}
      ></textarea>
   </label>
   {#if errors}<span class="invalid">{errors}</span>{/if}
</div>