import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/ApiResponse";
import { Product } from "../models/product";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/v1/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl);
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(
    categoryId: number,
    subcategoryId?: number
  ): Observable<ApiResponse<Product[]>> {
    if (subcategoryId == null) subcategoryId = -1;

    return this.http.get<ApiResponse<Product[]>>(
      `${this.apiUrl}/${categoryId}/${subcategoryId}`
    );
  }

  searchProducts(query: string): Observable<ApiResponse<Product[]>> {
    let searchTerm = query.toLowerCase();

    return this.http.get<ApiResponse<Product[]>>(
      `${this.apiUrl}/search/${searchTerm}`
    );
  }
}
