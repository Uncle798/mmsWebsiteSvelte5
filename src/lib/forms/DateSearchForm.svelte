<script lang='ts'>
	import DatePicker from '$lib/formComponents/DatePickerDual.svelte';
	import type { DateSearchFormSchema } from '$lib/formSchemas/dateSearchFormSchema';
	import dayjs from 'dayjs';
	import { parseDate } from '@skeletonlabs/skeleton-svelte';
	import { onMount } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
   interface Props {
      data: SuperValidated<Infer<DateSearchFormSchema>>;
      startDate: Date;
      endDate: Date;
      minDate: Date | undefined;
      maxDate: Date | undefined;
		label?: string;
      classes?: string;
   }
	let {
		data,
		startDate = $bindable(),
		endDate = $bindable(),
		minDate,
		maxDate,
		label='Search by date range',
		classes
	}: Props = $props();

	let { form, message, enhance, constraints, errors } = superForm(data, {
	});
	onMount(() => {
		$form.startDate = startDate;
		$form.endDate = endDate;
	});
	let dates = $state([startDate, endDate])
	$effect(()=>{
		if(dates){
			startDate = dates[0];
			endDate = dates[1];
		}
	})
</script>
<div class={classes}>
   <div class="flex gap-1">
      <DatePicker {minDate} {maxDate} bind:values={dates} {label}/>
   </div>
</div>

