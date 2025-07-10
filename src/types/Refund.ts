// src/types/Refund.ts

export interface IRefund {
  refund_id: number;
  type_acc_em: string; // .value probablemente devuelve el valor string del enum
  titular_acc_em: string;
  number_acc_em: string;
  type_acc_re: string; // .value probablemente devuelve el valor string del enum
  titular_acc_res: string;
  number_acc_res: string;
  value: string;
  image: string;
  created_at: string;
  refer_id: number;
  google_id: string;
  code_reference:string;
  porcetage_refund:string

}