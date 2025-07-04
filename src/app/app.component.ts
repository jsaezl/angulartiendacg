import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterOutlet, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatListModule } from "@angular/material/list";
import { AuthService } from "./core/services/auth.service";
import { CartService } from "./core/services/cart.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "shopping-cart-client";
  cartCount: number = 0;
  usuario: string = "";
  private cartSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //    this.usuario = this.authService.getCurrentUser()?.username ?? "";

    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.usuario = user?.username ?? "";
    });

    this.cartSubscription = this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log("Logout exitoso");
      },
      error: (error) => {
        console.error("Error en logout:", error);
        // Si falla la llamada al API, aún así cerramos la sesión localmente
        this.authService.logoutLocal();
      },
    });
  }
}
