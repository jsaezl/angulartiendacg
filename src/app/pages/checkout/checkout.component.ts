import { Component, inject, signal, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDividerModule } from "@angular/material/divider";
import { Router } from "@angular/router";
import { CartService } from "../../core/services/cart.service";
import {
  OrderService,
  CreateOrder,
  CreateOrderItem,
} from "../../core/services/order.service";
import { AuthService } from "../../core/services/auth.service";
import { CartItem } from "../../core/models/cart-item";
import { Subscription } from "rxjs";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Comuna, Region } from "src/app/core/models/location";
import { LocationService } from "src/app/core/services/location.service";

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.css"],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private locationService = inject(LocationService);

  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  cartItems = signal<CartItem[]>([]);
  subTotal = signal<number>(0);
  shippingCost = signal<number>(0);
  descuento = signal<number>(0); // New signal for discount
  cartTotal = signal<number>(0);

  loading = signal<boolean>(true);
  processing = signal<boolean>(false);
  checkoutForm!: FormGroup;
  regiones: Region[] = [];
  comunas: Comuna[] = [];
  loadingRegiones = false;
  loadingComunas = false;

  private cartSubscription?: Subscription;

  ngOnInit(): void {
    this.loadRegiones();
    this.loadCartItems();

    this.cartSubscription = this.cartService.cartItems$.subscribe((items) => {
      this.cartItems.set(items);
      this.calculateTotal();
    });

    this.initForm();
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  initForm(): void {
    const currentUser = this.authService.getCurrentUser();

    this.checkoutForm = this.fb.group({
      customerName: [
        currentUser?.username || "",
        [Validators.required, Validators.minLength(2)],
      ],
      customerEmail: [
        currentUser?.email || "",
        [Validators.required, Validators.email],
      ],
      customerPhone: [
        "",
        [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)],
      ],
      shippingAddress: ["", [Validators.required, Validators.minLength(10)]],
      regionId: [null, [Validators.required]],
      comunaId: [null, [Validators.required]],
    });

    // Listen for region changes
    this.checkoutForm.get("regionId")?.valueChanges.subscribe((regionId) => {
      console.log("Region changed to:", regionId);

      this.checkoutForm.get("comunaId")?.setValue(null);
      this.comunas = [];

      if (regionId) {
        // Check if regions are loaded before trying to load comunas
        if (this.regiones && this.regiones.length > 0) {
          this.loadComunas(regionId);
        } else {
          console.log(
            "Regions not loaded yet, will load comunas when available"
          );
          // Wait for regions to be loaded
          const checkRegions = setInterval(() => {
            if (this.regiones && this.regiones.length > 0) {
              clearInterval(checkRegions);
              this.loadComunas(regionId);
            }
          }, 100);
        }
      }
    });

    // Load user order header data
    this.orderService
      .getUserOrderHeaderDefault(currentUser?.username || "")
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (response.data == null) {
              // Set default region and load comunas
              this.checkoutForm.patchValue({
                regionId: 7,
              });

              // Wait for regions to be loaded before loading comunas
              this.waitForRegions(() => {
                this.loadComunas(7);
              });
              return;
            }

            // Set form values from user data
            this.checkoutForm.patchValue({
              customerName: response.data.customerName,
              customerPhone: response.data.customerPhone,
              shippingAddress: response.data.shippingAddress,
              regionId: response.data.regionId,
              comunaId: response.data.comunaId,
            });

            this.shippingCost.set(response.data.shippingCost || 0);
            this.calculateTotal();
            // Load comunas for the selected region
            if (response.data.regionId) {
              this.waitForRegions(() => {
                this.loadComunas(response.data.regionId);
              });
            }
          }
        },
        error: (error) => {
          console.error("Error loading order header:", error);
        },
      });
  }

  private waitForRegions(callback: () => void): void {
    if (this.regiones && this.regiones.length > 0) {
      callback();
    } else {
      setTimeout(() => this.waitForRegions(callback), 100);
    }
  }

  onRegionChange(regionId: number): void {
    console.log("Region changed from template:", regionId);
    this.checkoutForm.get("comunaId")?.setValue(null);
    this.comunas = [];

    if (regionId) {
      this.waitForRegions(() => {
        this.loadComunas(regionId);
      });
    }
  }

  onComunaChange(comunaId: number): void {
    console.log("Region changed from template:", comunaId);
    var cost = this.comunas.find((c) => c.id === comunaId)?.shippingCost;
    this.shippingCost.set(cost || 0);
    this.calculateTotal();
  }

  loadCartItems(): void {
    this.loading.set(true);
    this.cartService.getCartItems().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems.set(response.data);
          this.calculateTotal();
        } else {
          this.snackBar.open(
            response.message || "Error al cargar el carrito",
            "Cerrar",
            {
              duration: 3000,
            }
          );
          this.router.navigate(["/cart"]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error("Error loading cart items:", error);
        this.snackBar.open("Error al cargar el carrito", "Cerrar", {
          duration: 3000,
        });
        this.router.navigate(["/cart"]);
        this.loading.set(false);
      },
    });
  }

  loadRegiones(): void {
    this.loadingRegiones = true;
    this.locationService.getRegiones().subscribe({
      next: (response) => {
        if (response.success) {
          this.regiones = response.data;
        }
        this.loadingRegiones = false;
      },
      error: (error) => {
        console.error("Error loading regions:", error);
        this.loadingRegiones = false;
      },
    });
  }

  loadComunas(regionId: number): void {
    this.loadingComunas = true;

    // Check if regions are loaded before trying to find the region
    if (!this.regiones || this.regiones.length === 0) {
      console.log("Regions not loaded yet, skipping comunas");
      this.comunas = [];
      this.loadingComunas = false;
      return;
    }

    const regionSelected = this.regiones.find((m) => m.id == regionId);
    if (regionSelected != null) {
      console.log("Region found, loading comunas:", regionSelected.comunas);
      this.comunas = regionSelected.comunas || [];
    } else {
      console.log("Region not found for ID:", regionId);
      this.comunas = [];
    }

    this.loadingComunas = false;
  }

  calculateTotal(): void {
    console.log("Calculating total for cart items");

    this.subTotal.set(
      this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0)
    );

    if (this.shippingCost() == 1990 && this.subTotal() >= 80000) {
      this.descuento.set(1990);
    } else if (this.shippingCost() == 4990 && this.subTotal() >= 100000) {
      this.descuento.set(4990);
    } else {
      this.descuento.set(0);
    }

    let total = this.subTotal() + this.shippingCost() - this.descuento(); // Apply discount if any

    this.cartTotal.set(total);
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.snackBar.open(
        "Por favor, complete todos los campos requeridos correctamente",
        "Cerrar",
        {
          duration: 3000,
        }
      );
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open(
        "Debe iniciar sesión para realizar una compra",
        "Cerrar",
        {
          duration: 3000,
        }
      );
      this.router.navigate(["/login"]);
      return;
    }

    if (this.cartItems().length === 0) {
      this.snackBar.open("El carrito está vacío", "Cerrar", {
        duration: 3000,
      });
      this.router.navigate(["/cart"]);
      return;
    }

    this.processing.set(true);

    // Crear la orden desde el carrito
    const orderItems: CreateOrderItem[] = this.cartItems().map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const formValue = this.checkoutForm.value;

    const order: CreateOrder = {
      userId: currentUser.username,
      totalAmount: this.cartTotal(),
      orderItems: orderItems,
      customerName: formValue.customerName,
      customerEmail: formValue.customerEmail,
      customerPhone: formValue.customerPhone,
      shippingAddress: formValue.shippingAddress,
      comunaId: formValue.comunaId,
    };

    this.orderService.createOrder(order).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            "¡Orden creada exitosamente! Te enviaremos un email con los detalles.",
            "Cerrar",
            {
              duration: 5000,
            }
          );

          this.cartService.refreshCart();
          this.router.navigate(["/orders"]);
        } else {
          this.snackBar.open(
            response.message || "Error al crear la orden",
            "Cerrar",
            {
              duration: 5000,
            }
          );
        }
        this.processing.set(false);
      },
      error: (error) => {
        console.error("Error creating order:", error);
        const errorMessage = error.error?.message || "Error al crear la orden";
        this.snackBar.open(errorMessage, "Cerrar", {
          duration: 5000,
        });
        this.processing.set(false);
      },
    });
  }

  backToCart(): void {
    this.router.navigate(["/cart"]);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.hasError("required")) {
      return "Este campo es requerido";
    }
    if (field?.hasError("email")) {
      return "Ingrese un email válido";
    }
    if (field?.hasError("minlength")) {
      return `Mínimo ${field.errors?.["minlength"].requiredLength} caracteres`;
    }
    if (field?.hasError("pattern")) {
      switch (fieldName) {
        case "customerPhone":
          return "Ingrese un teléfono válido";
        default:
          return "Formato inválido";
      }
    }
    return "";
  }
}
