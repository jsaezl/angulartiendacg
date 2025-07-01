import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService, CreateOrder, CreateOrderItem } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../core/models/cart-item';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  
  cartItems = signal<CartItem[]>([]);
  cartTotal = signal<number>(0);
  loading = signal<boolean>(true);
  private cartSubscription?: Subscription;

  ngOnInit(): void {
    this.loadCartItems();
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems.set(items);
      this.calculateTotal();
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  loadCartItems(): void {
    this.loading.set(true);
    this.cartService.getCartItems().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems.set(response.data);
          this.calculateTotal();
        } else {
          this.snackBar.open(response.message || 'Error al cargar el carrito', 'Cerrar', {
            duration: 3000
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
        this.snackBar.open('Error al cargar el carrito', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.cartService.updateQuantity(itemId, newQuantity).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Cantidad actualizada', 'Cerrar', {
            duration: 2000
          });
        } else {
          this.snackBar.open(response.message || 'Error al actualizar cantidad', 'Cerrar', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.snackBar.open('Error al actualizar cantidad', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Item eliminado del carrito', 'Cerrar', {
            duration: 2000
          });
        } else {
          this.snackBar.open(response.message || 'Error al eliminar item', 'Cerrar', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.snackBar.open('Error al eliminar item', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  calculateTotal(): void {
    const total = this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0);
    this.cartTotal.set(total);
  }

  checkout(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('Debe iniciar sesión para realizar una compra', 'Cerrar', {
        duration: 3000
      });
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartItems().length === 0) {
      this.snackBar.open('El carrito está vacío', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    // Redirigir al checkout
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products-list']);
  }
} 