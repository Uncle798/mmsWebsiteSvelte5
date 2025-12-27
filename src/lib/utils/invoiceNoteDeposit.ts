import { humanUnitNum } from "./humanUnitNum";

export function invoiceNoteDeposit(unitNum:string){
   return `Deposit for unit ${humanUnitNum(unitNum)}`
}