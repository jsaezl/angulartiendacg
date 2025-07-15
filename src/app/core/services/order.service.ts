import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/ApiResponse";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  userId: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderItems: OrderItem[];
}

export interface CreateOrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrder {
  userId: string;
  totalAmount: number;
  shippingAddress?: string;
  comunaId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderItems: CreateOrderItem[];
}

export interface OrderHeader {
  shippingAddress?: string;
  regionId: number;
  comunaId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingCost: number;
}

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private http = inject(HttpClient);

  createOrder(order: CreateOrder): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${environment.apiUrl}/v1/orders`,
      order
    );
  }

  getUserOrders(userId: string): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      `${environment.apiUrl}/v1/orders/user/${userId}`
    );
  }

  getUserOrderHeaderDefault(
    userId: string
  ): Observable<ApiResponse<OrderHeader>> {
    return this.http.get<ApiResponse<OrderHeader>>(
      `${environment.apiUrl}/v1/orders/header/user/${userId}`
    );
  }
}
