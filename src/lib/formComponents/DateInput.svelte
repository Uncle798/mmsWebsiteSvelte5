<script lang="ts">
   import type { InputConstraint} from 'sveltekit-superforms';

   interface Props {
      value: Date | undefined | null;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      placeholder?: string | undefined;
      name: string | null | undefined;
   }
   let { value = $bindable(), label, errors, constraints, placeholder, name, ...others }:Props = $props()
</script>
<div class="mx-4">
<label class="label">
   {#if label}<span class="label-text">{label}</span>{/if}
   <input
      type="date"
      class="input"
      name={name}
      bind:value={value}
      aria-invalid={errors ? 'true' : undefined}
      placeholder={placeholder}
      {...constraints}
      {...others}
   />
 </label>
 {#if errors}<span class="invalid">{errors}</span>{/if}
</div>