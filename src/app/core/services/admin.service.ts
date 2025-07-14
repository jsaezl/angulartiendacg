import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Order } from "./order.service";
import { User } from "../models/user";
import { Category, Subcategory } from "../models/category";
import { Product } from "../models/product";

export interface AdminDashboard {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  keywords: string;
  categoryId?: number;
  subcategoryId?: number;
  imagesUrl?: string;
}

export interface UpdateProductRequest {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  keywords: string;
  categoryId?: number;
  subcategoryId?: number;
  imagesUrl?: string;
}

export interface UpdateProductImagesRequest {
  productId: number;
  images: string[];
}

export interface UpdateOrderStatusRequest {
  orderId: number;
  status: string;
}

export interface UpdateUserRoleRequest {
  userId: string;
  role: string;
}

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/v1/admin`;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardStats(): Observable<ApiResponse<AdminDashboard>> {
    return this.http.get<ApiResponse<AdminDashboard>>(
      `${this.apiUrl}/dashboard`
    );
  }

  // Products Management
  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`);
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(
    product: CreateProductRequest
  ): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(
      `${this.apiUrl}/products`,
      product
    );
  }

  updateProduct(
    product: UpdateProductRequest
  ): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(
      `${this.apiUrl}/products/${product.id}`,
      product
    );
  }

  deleteProduct(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/products/${id}`
    );
  }

  // Product Images Management
  updateProductImages(
    request: UpdateProductImagesRequest
  ): Observable<ApiResponse<Product>> {
    console.log("Updating product images:", request);

    return this.http.put<ApiResponse<Product>>(
      `${this.apiUrl}/products/${request.productId}/images`,
      request
    );
  }

  uploadProductImage(
    productId: number,
    file: File
  ): Observable<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append("image", file);

    return this.http.post<ApiResponse<{ url: string }>>(
      `${this.apiUrl}/products/${productId}/images/upload`,
      formData
    );
  }

  deleteProductImage(
    productId: number,
    imageUrl: string
  ): Observable<ApiResponse<object>> {
    console.log("Deleting product image:", { productId, imageUrl });

    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/products/${productId}/images`,
      { body: { imageUrl } }
    );
  }

  // Categories Management
  //  getCategories(): Observable<ApiResponse<Category[]>> {
  //  return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/categories`);
  //}

  // getSubcategories(categoryId: number): Observable<ApiResponse<Subcategory[]>> {
  //   return this.http.get<ApiResponse<Subcategory[]>>(
  //     `${this.apiUrl}/categories/${categoryId}/subcategories`
  //   );
  // }

  // Orders Management
  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders`);
  }

  getOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(
    request: UpdateOrderStatusRequest
  ): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(
      `${this.apiUrl}/orders/${request.orderId}/status`,
      request
    );
  }

  // Users Management
  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`);
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  updateUserRole(
    request: UpdateUserRoleRequest
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/users/${request.userId}/role`,
      request
    );
  }

  deleteUser(id: string): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(`${this.apiUrl}/users/${id}`);
  }
}
