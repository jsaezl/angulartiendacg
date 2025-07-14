import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
} from "@angular/common/http";
import { Observable, map } from "rxjs";
import { environment } from "../../../environments/environment";

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

@Injectable({
  providedIn: "root",
})
export class ImageUploadService {
  private apiUrl = `${environment.apiUrl}/v1/admin/product`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File, productId?: number): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append("image", file);

    if (productId) {
      formData.append("productId", productId.toString());
    }

    const req = new HttpRequest(
      "POST",
      `${this.apiUrl}/images/upload`,
      formData,
      {
        reportProgress: true,
        responseType: "json",
      }
    );

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(
              (100 * event.loaded) / (event.total || 1)
            );
            return { progress };

          case HttpEventType.Response:
            if (event.body?.success) {
              return {
                progress: 100,
                url: event.body.data.url,
              };
            } else {
              return {
                progress: 0,
                error: event.body?.message || "Error al subir imagen",
              };
            }

          default:
            return { progress: 0 };
        }
      })
    );
  }

  uploadMultipleImages(
    files: File[],
    productId?: number
  ): Observable<UploadProgress[]> {
    const uploads = files.map((file) => this.uploadImage(file, productId));
    return new Observable((observer) => {
      const results: UploadProgress[] = [];
      let completed = 0;

      uploads.forEach((upload, index) => {
        upload.subscribe({
          next: (progress) => {
            results[index] = progress;
            observer.next([...results]);
          },
          error: (error) => {
            results[index] = { progress: 0, error: error.message };
            observer.next([...results]);
          },
          complete: () => {
            completed++;
            if (completed === files.length) {
              observer.complete();
            }
          },
        });
      });
    });
  }

  deleteImage(
    imageUrl: string,
    productId?: number
  ): Observable<{ success: boolean; message?: string }> {
    const body: any = { imageUrl };
    if (productId) {
      body.productId = productId;
    }

    console.log("Deleting image:", body);

    return this.http.delete<{ success: boolean; message?: string }>(
      `${this.apiUrl}/images/delete`,
      { body }
    );
  }
}
