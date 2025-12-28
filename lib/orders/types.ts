export type OrderItemDisplay = {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  quantity: number;
  price: number;
  image: string | null;
};

export type OrderDisplayData = {
  id: string;
  email: string;
  date: Date;
  status: string;

  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };

  shippingInfo: {
    label: string;
    addressLines: string[];
  };

  contact: {
    name: string;
    phone: string;
    email: string;
  };

  items: OrderItemDisplay[];
};
