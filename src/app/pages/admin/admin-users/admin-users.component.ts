import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, UpdateUserRoleRequest } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'actions'];

  userRoles = [
    'User',
    'Admin'
  ];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
        } else {
          this.snackBar.open(response.message || 'Error al cargar usuarios', 'Cerrar', {
            duration: 3000
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  updateUserRole(user: User, newRole: string): void {
    const request: UpdateUserRoleRequest = {
      userId: user.id,
      role: newRole
    };

    this.adminService.updateUserRole(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Rol de usuario actualizado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.loadUsers();
        } else {
          this.snackBar.open(response.message || 'Error al actualizar rol', 'Cerrar', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.snackBar.open('Error al actualizar rol de usuario', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.username}"?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.loadUsers();
          } else {
            this.snackBar.open(response.message || 'Error al eliminar usuario', 'Cerrar', {
              duration: 3000
            });
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error al eliminar usuario', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  getRoleColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'warn';
      case 'user':
        return 'primary';
      default:
        return 'primary';
    }
  }

  canDeleteUser(user: User): boolean {
    // Don't allow deleting the current user or other admins
    // You might want to add logic to check if the current user is the one being deleted
    return user.role.toLowerCase() !== 'admin';
  }
} 