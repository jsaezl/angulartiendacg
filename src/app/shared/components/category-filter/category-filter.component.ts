import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatButtonModule } from "@angular/material/button";
import { Category, Subcategory } from "../../../core/models/category";
import { CategoryService } from "../../../core/services/category.service";

@Component({
  selector: "app-category-filter",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
  ],
  templateUrl: "./category-filter.component.html",
  styleUrls: ["./category-filter.component.css"],
})
export class CategoryFilterComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<{
    categoryId: number;
    subcategoryId?: number;
  }>();
  @Output() clearFilter = new EventEmitter<void>();

  categories: Category[] = [];
  selectedCategory: number | null = null;
  selectedSubcategory: number | null = null;
  loading = true;
  error: string | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
        } else {
          this.error = response.message || "Error al cargar categorías";
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = "Error al conectar con el servidor";
        this.loading = false;
        console.error("Error loading categories:", err);
      },
    });
  }

  onCategorySelect(categoryId: number): void {
    this.selectedCategory = categoryId;
    this.selectedSubcategory = null;

    this.categorySelected.emit({ categoryId });
  }

  onSubcategorySelect(subcategoryId: number): void {
    this.selectedSubcategory = subcategoryId;
    this.categorySelected.emit({
      categoryId: this.selectedCategory!,
      subcategoryId,
    });
  }

  onClearFilter(): void {
    this.selectedCategory = null;
    this.selectedSubcategory = null;
    this.clearFilter.emit();
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategory === categoryId;
  }

  isSubcategorySelected(subcategoryId: number): boolean {
    return this.selectedSubcategory === subcategoryId;
  }

  getCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();
    if (name.includes("electrónic") || name.includes("electronic"))
      return "devices";
    if (
      name.includes("ropa") ||
      name.includes("clothing") ||
      name.includes("moda")
    )
      return "checkroom";
    if (name.includes("hogar") || name.includes("home")) return "home";
    if (name.includes("deporte") || name.includes("sport"))
      return "sports_soccer";
    if (
      name.includes("libro") ||
      name.includes("book") ||
      name.includes("entretenimiento")
    )
      return "book";
    if (name.includes("juego") || name.includes("game"))
      return "sports_esports";
    if (name.includes("cocina") || name.includes("kitchen")) return "kitchen";
    if (name.includes("jardín") || name.includes("garden")) return "yard";
    if (name.includes("automóvil") || name.includes("car"))
      return "directions_car";
    if (name.includes("música") || name.includes("music")) return "music_note";
    return "category";
  }
}
