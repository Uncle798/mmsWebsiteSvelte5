
export function arrayOfYears(earliestYear:number | undefined){
   if(earliestYear === undefined){
      return [];
   }
   const thisYear = new Date().getFullYear();
   const years:number[] =[];
   for(let i=earliestYear; i<=thisYear; i++){
      years.push(i);
   }
   return years;
}

export function arrayOfMonthNames(){
   return ['January','February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}