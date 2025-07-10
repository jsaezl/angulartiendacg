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
import {
  AngularEditorConfig,
  AngularEditorModule,
} from "@kolkov/angular-editor";

export interface ProductDialogData {
  product?: Product;
  isEdit: boolean;
}

@Component({
  selector: "app-product-dialog",
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
    AngularEditorModule,
  ],
  templateUrl: "./product-dialog.component.html",
  styleUrls: ["./product-dialog.component.css"],
})
export class ProductDialogComponent implements OnInit {
  productForm: FormGroup;
  loading = false;
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  loadingCategories = false;
  loadingSubcategories = false;

  constructor(
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDialogData,
    private fb: FormBuilder,
    private adminService: AdminService,
    private categoryService: CategoryService
  ) {
    this.productForm = this.fb.group({
      name: ["", [Validators.required]],
      description: ["", [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      keywords: [""],
      categoryId: [null, [Validators.required]],
      subcategoryId: [null],
    });
  }

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "200px",
    minHeight: "0",
    placeholder: "Escribe aquí...",
    translate: "no",
    defaultParagraphSeparator: "p",
    defaultFontName: "Arial",
    toolbarHiddenButtons: [["insertImage", "insertVideo"]],
  };

  ngOnInit(): void {
    this.loadCategories();

    if (this.data.isEdit && this.data.product) {
      this.productForm.patchValue({
        name: this.data.product.name,
        description: this.data.product.description,
        price: this.data.product.price,
        stock: this.data.product.stock,
        keywords: this.data.product.keywords || "",
        categoryId: this.data.product.categoryId || null,
        subcategoryId: this.data.product.subcategoryId || null,
      });
    }

    // Listen for category changes
    this.productForm.get("categoryId")?.valueChanges.subscribe((categoryId) => {
      this.productForm.get("subcategoryId")?.setValue(null);
      this.subcategories = [];

      if (categoryId) {
        this.loadSubcategories(categoryId);
      }
    });
  }

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
  }

  loadSubcategories(categoryId: number): void {
    this.loadingSubcategories = true;

    console.log("load sub 1");
    var categoryselected = this.categories.find((m) => m.id == categoryId);
    if (categoryselected != null) {
      console.log("entre 2");
      this.subcategories = categoryselected.subcategories || [];
    }

    this.loadingSubcategories = false;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      const formValue = this.productForm.value;

      // Remove null values for category and subcategory
      if (!formValue.categoryId) {
        delete formValue.categoryId;
      }
      if (!formValue.subcategoryId) {
        delete formValue.subcategoryId;
      }

      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
