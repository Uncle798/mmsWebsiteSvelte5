import dayjs from "dayjs";
import { humanUnitNum } from "./humanUnitNum";

export function invoiceRentNote(unitNum:string, startingDate:Date){
   return `Rent for unit ${humanUnitNum(unitNum)} from ${dayjs(startingDate).format('MMMM D YYYY')} to ${dayjs(startingDate).add(1, 'month').format('MMMM D YYYY')}`
}