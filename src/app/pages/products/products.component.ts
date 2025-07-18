import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { ProductService } from "../../core/services/product.service";
import { CartService } from "../../core/services/cart.service";
import { CategoryFilterComponent } from "../../shared/components/category-filter/category-filter.component";
import { ProductSearchComponent } from "../../shared/components/product-search/product-search.component";
import { AuthService } from "src/app/core/services/auth.service";
import { Router } from "@angular/router";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ProductImageComponent } from "./product-image/product-image.component";
import { Product } from "src/app/core/models/product";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
@Component({
  selector: "app-products",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    CategoryFilterComponent,
    ProductSearchComponent,
    MatDialogModule,
    MatPaginatorModule,
  ],
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = true;
  error: string | null = null;
  addingToCart: { [productId: number]: boolean } = {};

  // Filter states
  selectedCategory: number | null = null;
  selectedSubcategory: number | null = null;
  searchQuery: string = "";
  isSearchActive: boolean = false;

  // Sorting
  sortBy: string = "";

  pageSize = 12;
  currentPage = 0;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  get paginatedProducts() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProducts.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
          this.filteredProducts = [...this.products];
          this.sortProducts();
        } else {
          this.error = response.message || "Error al cargar los productos";
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = "Error al conectar con el servidor";
        this.loading = false;
        console.error("Error loading products:", err);
      },
    });
  }

  onCategorySelected(filter: {
    categoryId: number;
    subcategoryId?: number;
  }): void {
    this.currentPage = 0; // Reset to first page
    this.selectedCategory = filter.categoryId;
    this.selectedSubcategory = filter.subcategoryId || null;
    this.isSearchActive = false;

    this.loadProductsByCategory(filter.categoryId, filter.subcategoryId);
  }

  onCategoryFilterCleared(): void {
    this.currentPage = 0;
    this.selectedCategory = null;
    this.selectedSubcategory = null;
    this.isSearchActive = false;
    this.filteredProducts = [...this.products];
    this.sortProducts();
  }

  onSearchResults(products: Product[]): void {
    this.currentPage = 0;
    this.filteredProducts = products;
    this.isSearchActive = true;
    this.sortProducts();
  }

  onSearchCleared(): void {
    this.currentPage = 0;
    if (!this.selectedCategory) {
      this.filteredProducts = [...this.products];
      this.sortProducts();
    }
    this.isSearchActive = false;
  }

  loadProductsByCategory(categoryId: number, subcategoryId?: number): void {
    this.loading = true;
    this.error = null;

    this.productService
      .getProductsByCategory(categoryId, subcategoryId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.filteredProducts = response.data;
            this.sortProducts();
          } else {
            this.error =
              response.message || "Error al cargar productos de la categoría";
            this.filteredProducts = [];
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = "Error al conectar con el servidor";
          this.filteredProducts = [];
          this.loading = false;
          console.error("Error loading products by category:", err);
        },
      });
  }

  onSortChange(): void {
    this.sortProducts();
  }

  private sortProducts(): void {
    if (!this.filteredProducts.length) return;

    this.filteredProducts.sort((a, b) => {
      switch (this.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  addToCart(product: Product): void {
    if (!this.isAuthenticated()) {
      this.snackBar.open(
        "Debe Iniciar Sesion o registrarse previamente",
        "Cerrar",
        {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        }
      );

      this.router.navigate(["/login"]);
    }

    this.addingToCart[product.id] = true;

    this.cartService.addToCart(product.id, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(`${product.name} agregado al carrito`, "Cerrar", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "bottom",
          });
        } else {
          this.snackBar.open(
            response.message || "Error al agregar al carrito",
            "Cerrar",
            {
              duration: 3000,
              horizontalPosition: "center",
              verticalPosition: "bottom",
            }
          );
        }
        this.addingToCart[product.id] = false;
      },
      error: (error) => {
        console.error("Error adding to cart:", error);
        this.snackBar.open("Error al agregar al carrito", "Cerrar", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
        });
        this.addingToCart[product.id] = false;
      },
    });
  }

  isAddingToCart(productId: number): boolean {
    return this.addingToCart[productId] || false;
  }

  openPictures(product: Product): void {
    this.dialog.open(ProductImageComponent, {
      width: "500px",
      data: { id: product.id, images: product.imagesUrl?.split(";") || [] },
    });
  }

  fisrtImagen(images: string): string {
    console.log("Product image URL:", images);

    return images?.split(";")[0] ?? "";
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedCategory) count++;
    if (this.selectedSubcategory) count++;
    if (this.isSearchActive) count++;
    return count;
  }
}
