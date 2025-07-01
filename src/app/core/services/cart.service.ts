import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { CartItem } from "../models/cart-item";
import { AuthService } from "./auth.service";

export interface AddToCartRequest {
  productId: number;
  quantity: number;
  userId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: "root",
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCartItems();
  }

  getCartItems(): Observable<ApiResponse<CartItem[]>> {
    const userId = this.getCurrentUserId();
    return this.http.get<ApiResponse<CartItem[]>>(
      `${environment.apiUrl}/v1/cart/${userId}`
    );
  }

  addToCart(
    productId: number,
    quantity: number = 1
  ): Observable<ApiResponse<CartItem>> {
    const userId = this.getCurrentUserId();
    const request: AddToCartRequest = {
      productId,
      quantity,
      userId,
    };

    return this.http
      .post<ApiResponse<CartItem>>(`${environment.apiUrl}/v1/cart`, request)
      .pipe(tap(() => this.loadCartItems()));
  }

  updateQuantity(
    itemId: number,
    quantity: number
  ): Observable<ApiResponse<CartItem>> {
    return this.http
      .put<ApiResponse<CartItem>>(`${environment.apiUrl}/v1/cart/${itemId}`, {
        quantity,
      })
      .pipe(tap(() => this.loadCartItems()));
  }

  removeItem(itemId: number): Observable<ApiResponse<object>> {
    return this.http
      .delete<ApiResponse<object>>(`${environment.apiUrl}/v1/cart/${itemId}`)
      .pipe(tap(() => this.loadCartItems()));
  }

  getCartTotal(): Observable<ApiResponse<number>> {
    const userId = this.getCurrentUserId();
    return this.http.get<ApiResponse<number>>(
      `${environment.apiUrl}/v1/cart/${userId}/total`
    );
  }

  getCartCount(): Observable<ApiResponse<number>> {
    const userId = this.getCurrentUserId();
    return this.http.get<ApiResponse<number>>(
      `${environment.apiUrl}/v1/cart/${userId}/count`
    );
  }

  private loadCartItems(): void {
    if (!this.authService.isAuthenticated()) {
      this.cartItemsSubject.next([]);
      this.cartCountSubject.next(0);
      return;
    }

    this.getCartItems().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItemsSubject.next(response.data);
          this.cartCountSubject.next(response.data.length);
        }
      },
      error: (error) => {
        console.error("Error loading cart items:", error);
        this.cartItemsSubject.next([]);
        this.cartCountSubject.next(0);
      },
    });
  }

  private getCurrentUserId(): string {
    let user = this.authService.getCurrentUser();
    return user!.username;
  }

  // Public method to refresh cart data
  refreshCart(): void {
    this.loadCartItems();
  }
}
