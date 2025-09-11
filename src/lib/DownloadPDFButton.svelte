<script lang="ts">
   interface Props {
      recordType: 'refundNum' | 'paymentNum' | 'invoiceNum';
      num: number
      classes?: string
   }
   let { recordType, num, classes }:Props=$props();
</script>
<div class={classes}>
   <a href="/api/downloadPDF?{recordType}={num.toString()}" 
      class="btn preset-filled-primary-50-950 h-8" 
      target="_blank"
   >
      Download PDF
   </a>
</div>