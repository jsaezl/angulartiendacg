import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  try {
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      token = currentUser?.token || null;
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
