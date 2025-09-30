import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RbacService {
  private _permissions = signal<string[]>([]);

  constructor() {
    // Restore permissions from localStorage on app start
    const saved = localStorage.getItem('permissions');
    if (saved) {
      try {
        this._permissions.set(JSON.parse(saved));
      } catch {
        localStorage.removeItem('permissions');
      }
    }
  }

  /** Called after login or refresh to set permissions */
  setPermissions(perms: string[]) {
    this._permissions.set(perms);
    localStorage.setItem('permissions', JSON.stringify(perms));
  }

  /** Clears permissions on logout */
  clearPermissions() {
    this._permissions.set([]);
    localStorage.removeItem('permissions');
  }

  /** Check a single permission */
  has(permission: string): boolean {
    return this._permissions().includes(permission);
  }

  /** Expose reactive permissions */
  permissions = this._permissions.asReadonly();
}
