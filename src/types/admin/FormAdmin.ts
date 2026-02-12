
export interface IFormRefundAdmin {
    date_init: string;
    date_end: string;
    google_id: string;
    type_acc_em: string;
    titular_acc_em: string;
    number_acc_em: string;
    type_acc_re: string;
    titular_acc_res: string;
    image: File | null;
    code_reference: string;
    number_acc_res: string;
    verification_code: string;    
    list_ids_refers: number[];
}