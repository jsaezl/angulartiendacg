import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";

@Component({
  selector: "app-product-image",
  templateUrl: "./product-image.component.html",
  styleUrls: ["./product-image.component.css"],
  standalone: true,
  imports: [CommonModule, MatDialogModule],
})
export class ProductImageComponent {
  images: string[] = [];
  id: number;
  current = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; images: string[] },
    public dialogRef: MatDialogRef<ProductImageComponent>
  ) {
    this.id = data.id;
    this.images = data.images.map(
      (p) => "assets/images/products/" + data.id + "/" + p
    );
  }

  next() {
    this.current = (this.current + 1) % this.images.length;
  }

  prev() {
    this.current = (this.current - 1 + this.images.length) % this.images.length;
  }
}
