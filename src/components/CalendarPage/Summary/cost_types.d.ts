export type CostType = {
  on_site: boolean;
  gl: string;
  method: string;
  id: number;
  amount: number;
  name: string;
  nr_of_items?: number;
};

export type PricesType = {
  total_costs: {
    sub_total: number;
    total_price: number;
    insurances: {
      cancel_insurance: number;
      insurance_costs: number;
    };
    required_costs: {
      not_on_site: CostType[];
      on_site: CostType[];
    };
    optional_costs: {
      not_on_site: CostType[];
      on_site: CostType[];
    };
  };
  optional_house_costs: CostType[];
  required_house_costs: CostType[];
  rent_price: number;
  discount: number;
  discounted_price: number;
  /** ISO 4217 currency code, e.g. "EUR". Returned by the REST price endpoint. */
  currency: string;
};
