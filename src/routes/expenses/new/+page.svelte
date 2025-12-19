<script lang="ts">
   import { Steps } from '@skeletonlabs/skeleton-svelte';
   import type { PageProps } from './$types';
   import Combobox from '$lib/formComponents/Combobox.svelte';
   import NewVendorForm from '$lib/forms/NewVendorForm.svelte';
   import NewExpenseForm from '$lib/forms/NewExpenseForm.svelte';
	import { goto } from '$app/navigation';

   let { data }: PageProps = $props();
   let comboboxData = $derived(data.vendors.map((vendor) => {
      return {
         label: vendor.organizationName ? vendor.organizationName : `${vendor.givenName} ${vendor.familyName}`,
         value: vendor.id,
      }
   }));
   let step = $derived(data.step);
</script>
<div class="mx-2 mt-14 sm:mt-12 mb-8">
   <Steps count={2} {step} onStepChange={(details) => (step = details.step)}>
      <Steps.List>
         <Steps.Item index={0}>
               <Steps.Trigger>
                  <Steps.Indicator>1</Steps.Indicator>
                  Chose vendor
               </Steps.Trigger>
               <Steps.Separator />
         </Steps.Item>
         <Steps.Item index={1}>
               <Steps.Trigger>
                  <Steps.Indicator>2</Steps.Indicator>
                  Enter expense details
               </Steps.Trigger>
         </Steps.Item>
      </Steps.List>
      <Steps.Content index={0}>
         <Combobox
            data={comboboxData}
            label='Select vendor'
            onValueChange={(d) => {
               goto(`/expenses/new?vendorId=${d.value[0]}`);
            }}
         />
         or
         <NewVendorForm data={data.newVendorForm} />
      </Steps.Content>
      <Steps.Content index={1} >
         {#if data.vendor}            
            <NewExpenseForm data={data.newExpenseForm} employeeId={data.user!.id} vendorId={data.vendor!.id}/>
         {/if}
      </Steps.Content> 
   </Steps>
</div>