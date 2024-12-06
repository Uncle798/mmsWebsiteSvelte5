<script lang="ts">
    import AddressForm from '$lib/forms/AddressForm.svelte';
   import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
   let addressModalOpen=$state(false)
</script>

<AddressForm data={data.addressForm} addressModalOpen={addressModalOpen} userId={data.user?.id} />