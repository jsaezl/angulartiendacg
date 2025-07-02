import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import {
  AdminService,
  UpdateOrderStatusRequest,
} from "../../../core/services/admin.service";
import { Order } from "../../../core/services/order.service";
import { OrderDialogComponent } from "../order-dialog/order-dialog.component";

@Component({
  selector: "app-admin-orders",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./admin-orders.component.html",
  styleUrls: ["./admin-orders.component.css"],
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  displayedColumns: string[] = [
    "id",
    "customerName",
    "orderDate",
    "totalAmount",
    "status",
    "actions",
  ];

  orderStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminService.getAllOrders().subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data;
        } else {
          this.snackBar.open(
            response.message || "Error al cargar órdenes",
            "Cerrar",
            {
              duration: 3000,
            }
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading orders:", error);
        this.snackBar.open("Error al cargar órdenes", "Cerrar", {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    const request: UpdateOrderStatusRequest = {
      orderId: order.id,
      status: newStatus,
    };

    this.adminService.updateOrderStatus(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            "Estado de orden actualizado exitosamente",
            "Cerrar",
            {
              duration: 3000,
            }
          );
          this.loadOrders();
        } else {
          this.snackBar.open(
            response.message || "Error al actualizar estado",
            "Cerrar",
            {
              duration: 3000,
            }
          );
        }
      },
      error: (error) => {
        console.error("Error updating order status:", error);
        this.snackBar.open("Error al actualizar estado de orden", "Cerrar", {
          duration: 3000,
        });
      },
    });
  }

  viewOrderDetails(order: Order): void {
    // You can implement a dialog to show order details
    console.log("Order details:", order);

    const dialogRef = this.dialog.open(OrderDialogComponent, {
      width: "500px",
      data: { order },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Order details closed");
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "pending":
        return "warn";
      case "processing":
        return "accent";
      case "shipped":
        return "primary";
      case "delivered":
        return "primary";
      case "cancelled":
        return "warn";
      default:
        return "primary";
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case "pending":
        return "Pendiente";
      case "processing":
        return "Procesando";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("es-ES");
  }
}
