export interface Category {
  id: number;
  name: string;
  description?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  categoryId: number;
  subcategoryId?: number;
}
