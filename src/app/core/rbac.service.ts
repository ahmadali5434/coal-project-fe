// src/app/core/rbac.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RbacService {
  private _permissions = signal<string[]>([]);

  /** Called after login to set permissions */
  setPermissions(perms: string[]) {
    this._permissions.set(perms);
  }

  /** Clears permissions on logout */
  clearPermissions() {
    this._permissions.set([]);
  }

  /** Check single permission */
  has(permission: string): boolean {
    console.log(`Checking permission: ${permission}`);
    return this._permissions().includes(permission);
  }

  /** Expose reactive permissions */
  permissions = this._permissions.asReadonly();
}
