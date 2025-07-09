import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // Necesario para redirigir
  let token: string | null = null;

  try {
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      token = currentUser?.token || null;

      // Verificar expiración del token
      if (token && isTokenExpired(token)) {
        console.warn("Token expirado. Redirigiendo a login.");
        localStorage.removeItem("currentUser");
        router.navigate(["/login"]);
        return new Observable(); // ⛔ Cancelar la solicitud
      }
    }
  } catch (error) {
    console.error("Error parsing currentUser from localStorage:", error);
    localStorage.removeItem("currentUser"); // Limpiar datos corruptos
  }

  // console.log("Token antes de Bearer:", token);

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    });
    // console.log("Request con Authorization header:", cloned.url);
    return next(cloned);
  }

  //console.log("Request sin Authorization header:", req.url);
  return next(req);
};

// 🔍 Función para verificar si un token JWT está expirado
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    console.error("Error al decodificar token:", e);
    return true; // si no se puede decodificar, consideramos que está expirado
  }
}
