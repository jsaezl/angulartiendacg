import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  loginData = {
    email: "",
    password: "",
  };

  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.snackBar.open("Inicio de sesión exitoso", "Cerrar", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
        
        if (response.data.role === "Admin") {
          this.router.navigate(["/admin"]);
        } else {
          this.router.navigate(["/products-list"]);
        }
      },
      error: (error) => {
        console.error("Error en el login:", error);
        const errorMessage = error.error?.message || "Error al iniciar sesión";
        this.snackBar.open(errorMessage, "Cerrar", {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "top"
        });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
