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
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Product } from "../../../core/services/product.service";
import { AdminService } from "../../../core/services/admin.service";
import { Category, Subcategory } from "../../../core/models/category";
import { CategoryService } from "src/app/core/services/category.service";
import { Order } from "src/app/core/services/order.service";

export interface OrderDialogData {
  order?: Order;
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
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./order-dialog.component.html",
  styleUrls: ["./order-dialog.component.css"],
})
export class OrderDialogComponent implements OnInit {
  // productForm: FormGroup;
  loading = false;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  loadingCategories = false;
  loadingSubcategories = false;

  constructor(
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDialogData,
    private fb: FormBuilder,
    private adminService: AdminService,
    private categoryService: CategoryService
  ) {
    /* this.productForm = this.fb.group({
      name: ["", [Validators.required]],
      description: ["", [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      keywords: [""],
      categoryId: [null, [Validators.required]],
      subcategoryId: [null],
    }) */
  }

  ngOnInit(): void {
    //this.loadCategories();
  }
  /* 
  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;

          if (
            this.data.isEdit &&
            this.data.product &&
            this.productForm.value.categoryId
          ) {
            this.loadSubcategories(this.productForm.value.categoryId);
          }
        }
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error("Error loading categories:", error);
        this.loadingCategories = false;
      },
    });
  } */

  onSubmit(): void {
    //   this.dialogRef.close(formValue);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
