import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";

import { tap } from "rxjs";
import { Router } from "@angular/router";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../models/user";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/v1/auth/login`, request)
      .pipe(tap((response) => this.handleAuthentication(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/v1/auth/register`, request)
      .pipe(tap((response) => this.handleAuthentication(response)));
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem("currentUser");
        this.currentUserSubject.next(null);
        this.router.navigate(["/login"]);
      })
    );
  }

  logoutLocal(): void {
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
    this.router.navigate(["/login"]);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "Admin";
  }

  private handleAuthentication(response: AuthResponse): void {
    let user: User = {
      id: "", // El backend no devuelve el ID en la respuesta
      username: response.data.username,
      email: response.data.email,
      role: response.data.role,
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      tokenExpiration: response.data.expiration,
    };

    console.log("Guardando usuario en localStorage:", user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
