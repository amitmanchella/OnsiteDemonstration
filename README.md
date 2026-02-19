# Onsite Demonstration

A demonstration of upgrading an Angular application from version 14 to version 18.

## Angular 14 to 18 Upgrade Demo

This repository serves as a demonstration of upgrading an Angular application from version 14 to version 18. The upgrade covers the following key changes:

### Upgrade Highlights

- **Angular 14 to 15**: Migration to standalone components, updated `@angular/router` APIs, and removal of deprecated `entryComponents`.
- **Angular 15 to 16**: Adoption of Signals for reactive state management, required inputs, and `DestroyRef` for cleaner subscription handling.
- **Angular 16 to 17**: New control flow syntax (`@if`, `@for`, `@switch`), deferrable views with `@defer`, and improved SSR hydration.
- **Angular 17 to 18**: Zoneless change detection support, stabilized Signals API, and new `withFetch` for `HttpClient`.

### Migration Steps

1. Update Angular CLI and core packages incrementally (one major version at a time).
2. Run `ng update` for each version to apply automatic migrations.
3. Address breaking changes and deprecated APIs at each step.
4. Update third-party dependencies for compatibility with each Angular version.
5. Run tests and verify application functionality after each upgrade.

### Key Configuration Changes

- Updated `angular.json` build configuration for the new application builder.
- Migrated from `NgModules` to standalone components where applicable.
- Replaced legacy `HttpModule` with `provideHttpClient()`.
- Updated RxJS usage patterns to align with v7+ best practices.
