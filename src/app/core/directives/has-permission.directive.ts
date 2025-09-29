// src/app/core/directives/has-permission.directive.ts
import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
    inject,
    effect,
  } from '@angular/core';
  import { RbacService } from '../rbac.service';
  
  @Directive({
    selector: '[hasPermission]',
    standalone: true,
  })
  export class HasPermissionDirective {
    private required: string[] = [];
    private rbac = inject(RbacService);
    private tpl = inject(TemplateRef<any>);
    private vcr = inject(ViewContainerRef);
  
    constructor() {
      // 🔄 React to permission changes
      effect(() => {
        this.updateView();
      });
    }
  
    @Input()
    set hasPermission(value: string | string[]) {
      console.log(`Value: ${JSON.stringify(value)}`);
      this.required = Array.isArray(value) ? value : [value];
      this.updateView();
    }
  
    private updateView() {
      this.vcr.clear();
      if (this.required.some((p) => this.rbac.has(p))) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    }
  }
  