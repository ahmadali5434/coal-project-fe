import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  isLoading = signal(false);

  show() {
    console.log('%c Loader SHOW called ', 'color: green; font-weight: bold;');
    this.isLoading.set(true);
  }

  hide() {
    console.log('%c Loader HIDE called ', 'color: red; font-weight: bold;');
    this.isLoading.set(false);
  }
}
