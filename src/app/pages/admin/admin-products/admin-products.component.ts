import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, CreateProductRequest, UpdateProductRequest } from '../../../core/services/admin.service';
import { Product } from '../../../core/services/product.service';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

@Component({
  selector: 'app-admin-products',
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
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'name', 'description', 'price', 'stock', 'actions'];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.adminService.getProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
        } else {
          this.snackBar.open(response.message || 'Error al cargar productos', 'Cerrar', {
            duration: 3000
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createProduct(result);
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: { product, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateProduct(product.id, result);
      }
    });
  }

  createProduct(productData: any): void {
    const createRequest: CreateProductRequest = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      imageUrl: productData.imageUrl,
      categoryId: productData.categoryId,
      subcategoryId: productData.subcategoryId
    };

    this.adminService.createProduct(createRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Producto creado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.loadProducts();
        } else {
          this.snackBar.open(response.message || 'Error al crear producto', 'Cerrar', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.snackBar.open('Error al crear producto', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  updateProduct(id: number, productData: any): void {
    const updateRequest: UpdateProductRequest = {
      id: id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      imageUrl: productData.imageUrl,
      categoryId: productData.categoryId,
      subcategoryId: productData.subcategoryId
    };

    this.adminService.updateProduct(updateRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.loadProducts();
        } else {
          this.snackBar.open(response.message || 'Error al actualizar producto', 'Cerrar', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.snackBar.open('Error al actualizar producto', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.adminService.deleteProduct(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.loadProducts();
          } else {
            this.snackBar.open(response.message || 'Error al eliminar producto', 'Cerrar', {
              duration: 3000
            });
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error al eliminar producto', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }
} 