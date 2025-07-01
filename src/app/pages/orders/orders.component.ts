import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('Debe iniciar sesión para ver sus órdenes', 'Cerrar', {
        duration: 3000
      });
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);
    let userId = currentUser.username;
    
    this.orderService.getUserOrders(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders.set(response.data);
        } else {
          this.snackBar.open(response.message || 'Error al cargar las órdenes', 'Cerrar', {
            duration: 3000
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Error al cargar las órdenes', 'Cerrar', {
          duration: 3000
        });
        this.loading.set(false);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warn';
      case 'processing':
        return 'accent';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'primary';
      case 'cancelled':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  continueShopping(): void {
    this.router.navigate(['/products-list']);
  }
} 