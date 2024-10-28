<script lang="ts">
   import type { InputConstraint } from 'sveltekit-superforms';
   
   interface Props {
      value:string;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      placeholder:string | undefined;
   }
   let { value = $bindable(), label, errors, constraints, placeholder='Password' }:Props = $props()
</script>

<label>
   {#if label}<span>{label}</span><br />{/if}
   <input
      type="password"
      class="input"
      bind:value={value}
      aria-invalid={errors ? 'true' : undefined}
      placeholder={placeholder}
      autocomplete="new-password"
      {...constraints}
   />
 </label>
 {#if errors}<span class="invalid">{errors}</span>{/if}