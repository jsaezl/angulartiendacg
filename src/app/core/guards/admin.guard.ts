import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();

    if (user && user.role === "Admin") {
      return true;
    } else {
      router.navigate(["/products-list"]);
      return false;
    }
  } else {
    router.navigate(["/login"]);
    return false;
  }
};
