// usePayU.ts


export function usePayU() {
  const generatePayUForm = (precio: number | undefined, titulo: string | undefined, buyerEmail: string | undefined, signature: string | undefined, referenceCode: string | undefined, extra_info: string) => {
    const PAYU_URL = import.meta.env.VITE_PAYU_URL;
    const MERCHANT_ID = import.meta.env.VITE_PAYU_MERCHANT_ID;
    const ACCOUNT_ID = import.meta.env.VITE_PAYU_ACCOUNT_ID;
    let extra1 = ''
    let extra2 = ''
    let extra3 = ''
    let extra4 = ''


    if (extra_info.length > 254) {
      let array_extra = extra_info.split('|')


      array_extra.map((value, index) => {

        if (index != 0) {
          if ((extra1 + '|' + value).length < 254) {
            extra1 = extra1 + '|' + value
          } else if ((extra2 + '|' + value).length < 254) {
            extra2 = extra2 + '|' + value
          }else if ((extra3 + '|' + value).length < 254) {
            extra3 = extra3 + '|' + value
          }else if ((extra4 + '|' + value).length < 254) {
            extra4 = extra4 + '|' + value
          }

        }

      })
    }

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
      extra1: extra_info.length > 254 ? extra1 : extra_info,
      extra2,
      extra3,
      extra4
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
