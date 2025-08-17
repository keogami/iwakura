// lib/router.ts
import { writable, derived, type Readable } from 'svelte/store';
import type { Component } from 'svelte';

interface Route {
  path: string;
  component: Component;
}

interface RouterParams {
  [key: string]: string;
}

class Router {
  private routes: Route[] = [];
  private currentHash = writable(this.getCurrentHash());

  public readonly currentComponent: Readable<Component | null>;
  public readonly params: Readable<RouterParams>;

  constructor() {
    this.currentComponent = derived(
      this.currentHash,
      (hash) => this.matchRoute(hash)?.component || null
    );

    this.params = derived(
      this.currentHash,
      (hash) => this.extractParams(hash)
    );

    // Listen for hash changes
    window.addEventListener('hashchange', this.handleHashChange);

    // Handle initial route
    this.handleHashChange();
  }

  private getCurrentHash(): string {
    return window.location.hash || '#/';
  }

  private handleHashChange = () => {
    this.currentHash.set(this.getCurrentHash());
  };

  private matchRoute(hash: string): Route | null {
    // Simple exact match for now - can be enhanced with params later
    return this.routes.find(route => route.path === hash) || null;
  }

  private extractParams(hash: string): RouterParams {
    // Placeholder for future param extraction
    // TODO: Implement :param parsing if needed
    return {};
  }

  public register(path: string, component: Component): void {
    this.routes.push({ path, component });
  }

  public navigate(path: string): void {
    window.location.hash = path;
  }

  public destroy(): void {
    window.removeEventListener('hashchange', this.handleHashChange);
  }
}

// Export singleton instance
export const router = new Router();

type Path = `#/${string}`;

// Convenience exports
export const navigate = (path: Path) => router.navigate(path);
export const registerRoute = (path: Path, component: Component) =>
  router.register(path, component);
export const currentComponent = router.currentComponent;
export const params = router.params;
