export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  keywords?: string;
  categoryId?: number;
  subcategoryId?: number;
  imagesUrl?: string;
}
