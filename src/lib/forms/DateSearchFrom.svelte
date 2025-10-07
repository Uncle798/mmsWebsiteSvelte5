<script lang='ts'>
	import DatePicker from '$lib/formComponents/DatePicker.svelte';
   import type { DateSearchFormSchema } from '$lib/formSchemas/schemas';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
   interface Props {
      data: SuperValidated<Infer<DateSearchFormSchema>>;
      startDate: Date | undefined;
      endDate: Date | undefined;
      minDate: Date | undefined;
      maxDate: Date | undefined;
      classes?: string;
   }
	let {
		data,
		startDate = $bindable(),
		endDate = $bindable(),
		minDate,
		maxDate,
		classes
	}: Props = $props();

	let { form, message, enhance, constraints, errors } = superForm(data, {
		onChange(event) {
			startDate = dayjs(event.get('startDate')).toDate();
			endDate = dayjs(event.get('endDate')).toDate();
		}
	});
	onMount(() => {
		$form.startDate = startDate;
		$form.endDate = endDate;
	});
</script>
<div class={classes}>
   <div class="flex gap-1">
      <DatePicker {minDate} {maxDate} />
      <DatePicker {minDate} {maxDate} />
   </div>
</div>

