// src/types/Refund.ts

export interface ISail {
  affiliaty: string; // .value probablemente devuelve el valor string del enum
  category_bought: string;
  category_price: string;
  is_refund: boolean; // .value probablemente devuelve el valor string del enum
  porcetage_refund: string;
  refund_price: string;
  refer_id:number;
  baucher_image:string
}