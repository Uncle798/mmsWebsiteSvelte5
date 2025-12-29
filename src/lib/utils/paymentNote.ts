export function paymentNote(invoiceNum: number, invoiceNotes: string | null){
   if(invoiceNotes){
      return `Payment for ${invoiceNum.toString()}, ${invoiceNotes}`
   } else {
      return `Payment for ${invoiceNum.toString}.`
   }
}