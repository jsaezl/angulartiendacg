import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { ApiResponse } from "../models/ApiResponse";
import { environment } from "../../../environments/environment";
import { Region } from "../models/location";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  private regionesUrl = `${environment.apiUrl}/v1/Location/regiones`;

  constructor(private http: HttpClient) {}

  getRegiones(): Observable<ApiResponse<Region[]>> {
    return this.http.get<ApiResponse<Region[]>>(this.regionesUrl);
  }
}
