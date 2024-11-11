<script lang="ts">
   import type { InputConstraint } from "sveltekit-superforms";
   interface Props {
      value:boolean;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      checked?: boolean;
      name: string | null | undefined
   }
   let { value = $bindable(), label, errors, constraints, checked=false, name, ...others }:Props = $props()
</script>
<label for="checkbox" class="label"><span class="label-text">{label}</span>
   {#if checked}
      <input 
         type="checkbox" 
         name={name} 
         class="checkbox" 
         checked
         bind:value={value} 
         aria-invalid={errors ? 'true' : undefined}
         {...constraints}
         {...others}
      />
   {:else}
      <input 
         type="checkbox" 
         name={name} 
         class="checkbox" 
         checked
         bind:value={value} 
         aria-invalid={errors ? 'true' : undefined}
         {...constraints}
         {...others}
      />
   {/if}
</label>
{#if errors}<span class="invalid">{errors}</span>{/if}