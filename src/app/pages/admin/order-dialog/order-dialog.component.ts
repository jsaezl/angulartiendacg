import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AdminService } from "../../../core/services/admin.service";
import { Order } from "src/app/core/services/order.service";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";

export interface OrderDialogData {
  orderId: number;
}

@Component({
  selector: "app-order-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: "./order-dialog.component.html",
  styleUrls: ["./order-dialog.component.css"],
})
export class OrderDialogComponent implements OnInit {
  // productForm: FormGroup;
  loading = false;
  order?: Order;

  constructor(
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDialogData,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    this.loading = true;
    this.adminService.getOrder(this.data.orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.order = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading order:", error);
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
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
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
