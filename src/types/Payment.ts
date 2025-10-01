  export interface IPaymentResponsePayu {
    signature: string;
    reference_code: string;
    price: number;
  }

  export interface IPaymentResponsePayPal {
    approval_url:string
  }


  export enum OptionsEmergentBuy {
    UserInternal = 'userinternal',
    UserExternal = 'userexternal'
  }