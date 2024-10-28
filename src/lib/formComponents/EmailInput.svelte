<script lang="ts">
   import type { InputConstraint } from 'sveltekit-superforms';
   
   interface Props {
      value:string;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      placeholder:string | undefined;
   }
   let { value = $bindable(), label, errors, constraints, placeholder='email@email.com' }:Props = $props()
</script>

<label>
   {#if label}<span class="label-text">{label}</span><br />{/if}
   <input
      type="email"
      class="input"
      bind:value={value}
      aria-invalid={errors ? 'true' : undefined}
      placeholder={placeholder}
      autocomplete="email"
      {...constraints}
   />
 </label>
 {#if errors}<span class="invalid">{errors}</span>{/if}