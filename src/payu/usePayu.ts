// usePayU.ts


export function usePayU() {
  const generatePayUForm = (precio:number | undefined, titulo:string | undefined, buyerEmail: string | undefined, signature:string | undefined, referenceCode: string | undefined) => {
    const PAYU_URL = import.meta.env.VITE_PAYU_URL;
    const MERCHANT_ID = import.meta.env.VITE_PAYU_MERCHANT_ID;
    const ACCOUNT_ID = import.meta.env.VITE_PAYU_ACCOUNT_ID;


    localStorage.removeItem('google_affiliaty')

    const amount = precio?.toString();
    const currency = 'COP';
    const test = '1';


    const form = document.createElement('form');
    form.method = 'POST';
    form.action = PAYU_URL;

    const params = {
      merchantId: MERCHANT_ID,
      accountId: ACCOUNT_ID,
      description: titulo,
      referenceCode: referenceCode,
      amount: amount,
      currency: currency,
      signature: signature,
      test: test,
      buyerEmail: buyerEmail,
      responseUrl: `${window.location.origin}/payment-response`,
      confirmationUrl: `http://www.cursosestudiaytrabaja.com:5000/payu-confirmation`,
      tax: '0',
      taxReturnBase: '0',
      extra1: "JSON.stringify({ categoryId: item.id, userId: buyerId })"
    };

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return { generatePayUForm };
}
