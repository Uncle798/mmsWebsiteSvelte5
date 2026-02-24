<script lang="ts">
	import { PUBLIC_COMPANY_NAME } from "$env/static/public";

   interface Props {
      recordType: 'refundNum' | 'paymentNum' | 'invoiceNum';
      num: number
      classes?: string
   }
   let { recordType, num, classes }:Props=$props();
   let fileName = $state(`${PUBLIC_COMPANY_NAME} `)
   switch (recordType) {
      case 'refundNum':
         fileName += `refund record ${num.toString()}`;
         break;
      case 'invoiceNum':
         fileName += `invoice number ${num.toString()}`;
         break;
      case 'paymentNum':
         fileName += `payment number ${num.toString()}`;
         break;
      default:
         break;
   }
</script>
<div class={classes}>
   <a href="/api/downloadPDF?{recordType}={num.toString()}" 
      class="btn preset-filled-primary-50-950 h-8" 
      download={fileName}
   >
      Download PDF
   </a>
</div>