<script lang="ts">
	import DateSearchFrom from '$lib/forms/DateSearchForm.svelte';
	import dayjs from 'dayjs';
   import type { PageProps } from './$types';

   let { data }: PageProps = $props();
   let startDate = $state(dayjs('01/01/2018').toDate());
   let endDate = $state(new Date());
</script>
<div class="mt-10 mb-8 mx-2">
   <DateSearchFrom data={data.dateSearchForm} bind:startDate={startDate} bind:endDate={endDate} minDate={dayjs('01/01/2018').toDate()} maxDate={new Date()}/>
</div>
<div class="mx-2">
   start date: {startDate}
   end date: {endDate}
</div>