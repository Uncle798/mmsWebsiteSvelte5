export function currencyFormatter(num: number){
   const formatter = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
   return formatter.format(num);
}