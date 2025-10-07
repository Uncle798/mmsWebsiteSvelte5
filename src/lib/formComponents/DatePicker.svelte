<script lang="ts">
   import { DatePicker, parseDate, Portal } from "@skeletonlabs/skeleton-svelte";
   interface Props {
      label?: string;
      minDate?: Date;
      maxDate?: Date;
      classes?: string;
   }
   let { maxDate, minDate, label, classes }:Props = $props();

   let value = $state([parseDate(new Date())])

</script>
<div class={classes}>
   <DatePicker 
      {value} 
      onValueChange={(e) => (value = e.value)} 
      min={minDate ? parseDate(minDate) : undefined}
      max={maxDate ? parseDate(maxDate) : undefined}
   > 
      <DatePicker.Label>{label}</DatePicker.Label>
      <DatePicker.Control>
         <DatePicker.Input placeholder = 'mm/dd/yyyy' />
         <DatePicker.Trigger />
      </DatePicker.Control>
      <Portal>
         <DatePicker.Positioner>
            <DatePicker.Content>
               <DatePicker.YearSelect />
               <DatePicker.MonthSelect />
               <DatePicker.View view='day'>
                  <DatePicker.Context>
                     {#snippet children(date)}
                        <DatePicker.ViewControl>
                           <DatePicker.PrevTrigger />
                           <DatePicker.ViewTrigger disabled>
                              <DatePicker.RangeText />
                           </DatePicker.ViewTrigger>
                           <DatePicker.NextTrigger />
                        </DatePicker.ViewControl>
                        <DatePicker.Table>
                           <DatePicker.TableHead>
                              <DatePicker.TableRow>
                                 {#each date().weekDays as weekDay, id (id)}
                                    <DatePicker.TableHeader>
                                       {weekDay.short}
                                    </DatePicker.TableHeader>
                                 {/each}
                              </DatePicker.TableRow>
                           </DatePicker.TableHead>
                           <DatePicker.TableBody>
                              {#each date().weeks as week, id (id) }
                                 <DatePicker.TableRow>
                                    {#each week as day, id (id)}
                                       <DatePicker.TableCell value={day}>
                                          <DatePicker.TableCellTrigger>
                                             {day.day}
                                          </DatePicker.TableCellTrigger>
                                       </DatePicker.TableCell>
                                    {/each}
                                 </DatePicker.TableRow>
                              {/each}
                           </DatePicker.TableBody>
                        </DatePicker.Table>
                     {/snippet}
                  </DatePicker.Context>
               </DatePicker.View>
               <DatePicker.View view='year'>
                  <DatePicker.Context>
                     {#snippet children(date)}
                        <DatePicker.ViewControl>
                           <DatePicker.PrevTrigger />
                           <DatePicker.ViewTrigger>
                              <DatePicker.RangeText />
                           </DatePicker.ViewTrigger>
                           <DatePicker.NextTrigger />
                        </DatePicker.ViewControl>
                        <DatePicker.Table>
                           <DatePicker.TableBody>
                              {#each date().getYearsGrid({columns:4}) as years, id (id)}
                                 <DatePicker.TableRow>
                                    {#each years as year, id (id)}
                                       <DatePicker.TableCell value={year.value}>
                                          <DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
                                       </DatePicker.TableCell>
                                    {/each}
                                 </DatePicker.TableRow>
                              {/each}
                           </DatePicker.TableBody>
                        </DatePicker.Table>
                     {/snippet}
                  </DatePicker.Context>
               </DatePicker.View>
            </DatePicker.Content>
         </DatePicker.Positioner>
      </Portal>
   </DatePicker>
</div>