import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Product } from '../../../core/services/product.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCardModule
  ],
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit {
  @Output() searchResults = new EventEmitter<Product[]>();
  @Output() searchCleared = new EventEmitter<void>();

  searchControl = new FormControl('');
  filteredProducts: Observable<Product[]> = of([]);
  isSearching = false;
  searchResultsList: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.setupSearch();
  }

  setupSearch(): void {
    this.filteredProducts = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || value.length < 2) {
          this.searchResultsList = [];
          this.searchCleared.emit();
          return of([]);
        }
        
        this.isSearching = true;
        return this.productService.searchProducts(value).pipe(
          map(response => {
            this.isSearching = false;
            if (response.success) {
              this.searchResultsList = response.data;
              this.searchResults.emit(response.data);
              return response.data;
            } else {
              this.searchResultsList = [];
              this.searchResults.emit([]);
              return [];
            }
          })
        );
      })
    );
  }

  onSearch(): void {
    const query = this.searchControl.value;
    if (query && query.length >= 2) {
      this.isSearching = true;
      this.productService.searchProducts(query).subscribe({
        next: (response) => {
          this.isSearching = false;
          if (response.success) {
            this.searchResultsList = response.data;
            this.searchResults.emit(response.data);
          } else {
            this.searchResultsList = [];
            this.searchResults.emit([]);
          }
        },
        error: (error) => {
          this.isSearching = false;
          console.error('Search error:', error);
          this.searchResultsList = [];
          this.searchResults.emit([]);
        }
      });
    }
  }

  onClearSearch(): void {
    this.searchControl.setValue('');
    this.searchResultsList = [];
    this.searchCleared.emit();
  }

  displayFn(product: Product): string {
    return product ? product.name : '';
  }

  getProductImage(product: Product): string {
    return `assets/images/${product.id}.jpg`;
  }
} 