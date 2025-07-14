import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-product-images-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './product-images-preview.component.html',
  styleUrls: ['./product-images-preview.component.css']
})
export class ProductImagesPreviewComponent {
  @Input() images: string[] = [];
  @Input() maxDisplay = 3;
  @Input() showCount = true;
  @Input() clickable = false;
  @Output() imageClick = new EventEmitter<string>();

  get displayImages(): string[] {
    return this.images.slice(0, this.maxDisplay);
  }

  get remainingCount(): number {
    return Math.max(0, this.images.length - this.maxDisplay);
  }

  onImageClick(image: string): void {
    if (this.clickable) {
      this.imageClick.emit(image);
    }
  }

  hasImages(): boolean {
    return this.images && this.images.length > 0;
  }
} 