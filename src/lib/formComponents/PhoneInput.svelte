<script lang="ts">
	import { PUBLIC_PHONE } from '$env/static/public';
   import type { InputConstraint } from 'sveltekit-superforms';
   
   interface Props {
      value:string;
      label: string | undefined;
      errors: string[] | undefined;
      constraints: InputConstraint | undefined;
      placeholder?:string | undefined;
      name: string;
   }
   let { value = $bindable(), label, errors, constraints, placeholder=PUBLIC_PHONE, name, ...others }:Props = $props()
   function formatPhoneOnChange(event:Event & {currentTarget: EventTarget & HTMLInputElement; }) {
      const digits = event.currentTarget.value.replace(/\D/g, '').substring(0,10)
      const areaCode = digits.substring(0, 3);
      const prefix = digits.substring(3,6);
      const suffix = digits.substring(6,10);
      if(digits.length > 6){
         event.currentTarget.value=`(${areaCode}) ${prefix}-${suffix}`;
      } else if(digits.length > 3){
         event.currentTarget.value=`(${areaCode}) ${prefix}`;
      } else if(digits.length > 0){
         event.currentTarget.value=`(${areaCode}`
      }
   }
   function formatPhoneOnKeyPress(event:KeyboardEvent & {currentTarget: EventTarget & HTMLInputElement; }) {
      const digits = event.currentTarget.value.replace(/\D/g, '').substring(0,10)
      const areaCode = digits.substring(0, 3);
      const prefix = digits.substring(3,6);
      const suffix = digits.substring(6,10);
      if(digits.length > 6){
         event.currentTarget.value=`(${areaCode}) ${prefix}-${suffix}`;
      } else if(digits.length > 3){
         event.currentTarget.value=`(${areaCode}) ${prefix}`;
      } else if(digits.length > 0){
         event.currentTarget.value=`(${areaCode}`
      }
   }
</script>
<label>
   {#if label}<span class="label-text">{label}</span>{/if}
   <input
      type="tel"
      name={name}
      class="input"
      bind:value={value}
      aria-invalid={errors ? 'true' : undefined}
      placeholder={placeholder}
      autocomplete="tel"
      {...constraints}
      {...others} 
      onchange={(event) => formatPhoneOnChange(event)}
      onkeyup={(event) => formatPhoneOnKeyPress(event)}
   />
 </label>
 {#if errors}<span class="invalid">{errors}</span>{/if}

