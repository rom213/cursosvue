export interface AuthResponse {
  success: boolean;
  user?: {
    google_id: string;
    email: string;
    is_bought:boolean
    name: string;
    picture: string;
    rol: string;
    register: boolean;
    given_name: string;
    num_whatsapp:string;
    prefix:string;
    accounts: IAccount[]
  };
  error?: string;
}

export enum typeAcc {
  nequi = "nequi",
  daviplata = "daviplata",
  llave = "llave"
}

interface IAccount{
  id:number;
  name_acc:typeAcc;
  number_acc:string
}



export interface IUserAfiliaty{
  name: string
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}