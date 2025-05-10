  export interface IPaymentResponse {
    signature: string;
    reference_code: string;
    price: number;
  }


  export enum OptionsEmergentBuy {
    UserInternal = 'userinternal',
    UserExternal = 'userexternal'
  }