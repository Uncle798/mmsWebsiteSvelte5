<script lang="ts">
	import DatePicker from '$lib/formComponents/DatePicker.svelte';
	import DateSearchFrom from '$lib/forms/DateSearchFrom.svelte';
	import dayjs from 'dayjs';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
</script>
<div class="mt-10 mb-8 mx-2">
   <DateSearchFrom data={data.dateSearchForm} startDate={dayjs('01/01/2018').toDate()} endDate={new Date()} />
</div>