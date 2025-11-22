
export interface PaypalOrderData {
    intent: string;
    purchase_units: {
        amount: {
            currency_code: string;
            value: string;
        };
    }[];
    application_context: {
        brand_name: string;
        landing_page: string;
        user_action: 'PAY_NOW' | 'CONTINUE';
        return_url: string;
        cancel_url: string;
    };
}
