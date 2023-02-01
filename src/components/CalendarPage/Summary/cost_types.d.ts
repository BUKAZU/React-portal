export type CostType = {
  on_site: boolean;
  gl: string;
  method: string;
  id: number;
  amount: number;
  name: string;
};

export type PricesType = {
  total_costs: {
    sub_total: number;
    total_price: number;
    insurances: {
      cancel_insurance: number;
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
};
