export interface IBalance {
  count: number;
  non_refunded_value: number;
  refunded_value: number;
  total_value_all_refunds: number;
  courses_payments_value: number;
  list_ids_refers: [number] | []
}