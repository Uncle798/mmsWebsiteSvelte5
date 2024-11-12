<script lang="ts">
	import type { PartialContactInfo } from "$lib/server/partialTypes";
   interface Props {
      address: PartialContactInfo;
   }
   let {address}:Props = $props()
</script>

<div class="card p-4">
   <p>{address.address1}</p>
   <p>{address.city.trim()}, {address.state.trim()}, {address.zip.trim()}</p>
</div>