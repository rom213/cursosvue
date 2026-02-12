import type { IPagination } from "../Pagination";
import type { IRefund } from "../Refund";
import type { IAccount } from "../Auth";

// Interfaz para el objeto 'user'
interface User {
  created_at: string;
  delete_at: string | null;
  email: string;
  google_id: string;
  id: number;
  name: string;
  num_whatsapp: string | null;
  picture: string;
  rol: string;
}

interface Refers {
   refer_id:number;
   value:number;
   porcentage:string;
   created_at:string;
   valor_curso:string
}



// Interfaz para cada elemento en el array 'records'
export interface IRecordItem {
  created_at: string;
  google_id: string;
  is_pay: boolean;
  porcentage: string;
  refer_id: number;
  refund: IRefund;
  user: User;
  value: string;
}

export interface IRecordItemRefund {
  refund_id: number;
  type_acc_re:string;
  titular_acc_res:string;
  number_acc_res:string;
  titular_acc_em:string;
  type_acc_em: string;
  number_acc_em:string;
  value:number;
  image:string;
  created_at:string;
  code_reference:string;
  user:User;
  google_id:string;
  refers:Refers[];
}

export interface IPendingRefund {
    refers_count:number;
    total_owed:number;
    user:User
}





export interface IRecordItemPendingRefunds {
    0: IPendingRefund[]
}

export interface IRecordItemAccount {
  0: IAccount[] | [];
}

export interface IApiResponseAccount {
  message: string ;
  records: IRecordItemAccount
  status: string;
  pagination:IPagination | null
}


export interface IApiResponsePendingRefunds {
    message: string ;
    records: IRecordItemPendingRefunds;
    status: string;
    pagination:IPagination | null
}


export interface IRecordBalance {
  count: number;
  non_refunded_value: number;
  refunded_value: number;
  total_value_all_refunds: number;
  courses_payments_value: number;
  list_ids_refers:number[];
}

export interface IApiResponseRefund {
  message: string ;
  records:IRecordItemRefund[] | [];
  status: string;
  pagination:IPagination | null
}

export interface IApiResponseRefer {
  message: string ;
  records: IRecordItem[] | [];
  status: string;
  pagination:IPagination | null
}

export interface IApiResponseBalance {
  message: string ;
  records: IRecordBalance[] | [];
  status: string;
  pagination:IPagination | null
}

export interface IApiResponseVoid {
  message: string ;
  records: [];
  status: string;
}