<script lang='ts'>
	import dayjs from 'dayjs';
   import utc  from 'dayjs/plugin/utc';
   import type { Expense, User } from '../../generated/prisma/browser'
	import HorizontalDivider from './HorizontalDivider.svelte';
	import { currencyFormatter } from '$lib/server/pdfMake/pdfMake';
   dayjs.extend(utc);
   interface Props {
      expense:Expense;
      employee:User;
      vendor:User;
      classes?: string;
   }
   let { expense, employee, vendor, classes }:Props = $props();
</script>

<div class="{classes} grid grid-cols-2 gap-x-2">
   <div class="col-span-2 text-center text-sm font-bold">Expense</div>
   <div class="text-right">Explanation</div>
   <div class="font-medium"><a href="/expenses/{expense.id}" class="anchor">{expense.explanation}</a></div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Date purchased</div>
   <div class="font-medium">{dayjs(expense.datePurchased).format('MMMM D YYYY')}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Employee</div>
   <div class="font-medium">{`${employee.givenName} ${employee.familyName}`}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Vendor</div>
   <div class="font-medium">{`${vendor.organizationName}`}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Amount</div>
   <div class="font-medium">${currencyFormatter.format(expense.amount)}</div>
   <HorizontalDivider classes='col-span-2'/>
   <div class="text-right">Receipt</div>
   <div class="font-medium"><a href={expense.receiptLink} class="anchor">Link</a></div>
   <HorizontalDivider classes='col-span-2'/>
</div>