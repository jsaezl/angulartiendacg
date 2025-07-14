import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormsModule } from "@angular/forms";
import { Product } from "../../../core/models/product";
import {
  ImageUploadService,
  UploadProgress,
} from "../../../core/services/image-upload.service";

export interface ProductImagesDialogData {
  product: Product;
  images: string[];
}

export interface ImageFile {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  uploaded: boolean;
  url?: string;
}

@Component({
  selector: "app-product-images-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: "./product-images-dialog.component.html",
  styleUrls: ["./product-images-dialog.component.css"],
})
export class ProductImagesDialogComponent implements OnInit {
  product: Product;
  existingImages: string[] = [];
  newImages: ImageFile[] = [];
  dragOver = false;
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  maxImages = 10;

  constructor(
    private dialogRef: MatDialogRef<ProductImagesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductImagesDialogData,
    private snackBar: MatSnackBar,
    private imageUploadService: ImageUploadService
  ) {
    this.product = data.product;
    this.existingImages = data.images || [];
  }

  ngOnInit(): void {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  processFiles(files: File[]): void {
    const totalImages = this.existingImages.length + this.newImages.length;

    if (totalImages + files.length > this.maxImages) {
      this.snackBar.open(
        `Máximo ${this.maxImages} imágenes permitidas`,
        "Cerrar",
        { duration: 3000 }
      );
      return;
    }

    files.forEach((file) => {
      if (!this.validateFile(file)) {
        return;
      }

      const imageFile: ImageFile = {
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        progress: 0,
        uploaded: false,
      };

      this.newImages.push(imageFile);
      this.uploadImage(imageFile);
    });
  }

  validateFile(file: File): boolean {
    if (!this.allowedTypes.includes(file.type)) {
      this.snackBar.open(
        "Solo se permiten archivos JPG, PNG y WebP",
        "Cerrar",
        { duration: 3000 }
      );
      return false;
    }

    if (file.size > this.maxFileSize) {
      this.snackBar.open(
        "El archivo es demasiado grande. Máximo 5MB",
        "Cerrar",
        { duration: 3000 }
      );
      return false;
    }

    return true;
  }

  uploadImage(imageFile: ImageFile): void {
    imageFile.uploading = true;
    imageFile.progress = 0;

    // Usar el servicio real de upload
    this.imageUploadService
      .uploadImage(imageFile.file, this.product.id)
      .subscribe({
        next: (progress: UploadProgress) => {
          imageFile.progress = progress.progress;

          if (progress.progress === 100 && progress.url) {
            imageFile.uploading = false;
            imageFile.uploaded = true;
            imageFile.url = progress.url;
          }
        },
        error: (error) => {
          imageFile.uploading = false;
          imageFile.progress = 0;
          this.snackBar.open(
            `Error al subir ${imageFile.file.name}: ${error.message}`,
            "Cerrar",
            { duration: 3000 }
          );
        },
      });
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  removeNewImage(index: number): void {
    const imageFile = this.newImages[index];
    if (imageFile.preview) {
      URL.revokeObjectURL(imageFile.preview);
    }
    this.newImages.splice(index, 1);
  }

  getTotalImages(): number {
    return this.existingImages.length + this.newImages.length;
  }

  canAddMoreImages(): boolean {
    return this.getTotalImages() < this.maxImages;
  }

  onSave(): void {
    const allImages = [
      ...this.existingImages,
      ...this.newImages
        .filter((img) => img.uploaded && img.url)
        .map((img) => img.url!),
    ];

    this.dialogRef.close({
      images: allImages,
      removedImages: this.newImages.filter((img) => !img.uploaded),
    });
  }

  onCancel(): void {
    // Limpiar URLs de preview
    this.newImages.forEach((img) => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    this.dialogRef.close();
  }

  getImageUrl(image: string | ImageFile): string {
    if (typeof image === "string") {
      return image;
    }
    return image.preview;
  }

  isUploading(): boolean {
    return this.newImages.some((img) => img.uploading);
  }

  canSave(): boolean {
    return this.getTotalImages() > 0 && !this.isUploading();
  }
}
