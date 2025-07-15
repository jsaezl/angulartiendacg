export interface Region {
  id: number;
  name: string;
  comunas?: Comuna[];
}

export interface Comuna {
  id: number;
  name: string;
  regionId: number;
  shippingCost: number;
}
