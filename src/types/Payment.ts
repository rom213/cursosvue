interface User {
  google_id: string;
}

  
  export interface IPaymentResponsePayu {
    signature: string;
    reference_code: string;
    price: number;
  }

  export interface IPaymentResponsePayPal {
    approval_url:string
  }

  export interface ICuponResponsePayu {
    status: string;
    message: string;
    records: {
        google_id: string;
        cupon: string;
        signature: string;
        reference_code: string;
        price: string;
        descuento: number;
    }[];
}




  export enum OptionsEmergentBuy {
    UserInternal = 'userinternal',
    UserExternal = 'userexternal',
    UserInternalCupon = 'userinternalcupon'
  }

  export enum OptionBuyPay {
    Paypal = 'paypal',
    PayU = 'payu',
  }