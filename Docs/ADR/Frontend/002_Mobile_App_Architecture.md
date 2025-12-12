# ADR: Mobile App Architecture — Monorepo, Shared Packages, and Framework Selection

**Status:** Proposed  
**Date:** 2025-12-05
**Sprint:** 11
**Related ADRs:** ADR_Frontend_Standards

## Context

DRCCS currently has a full-featured web client (`client-app/`) serving all user types (responders, admins, citizens). To expand reach and improve mobile user experience during disaster response:

1. **Responders** need a mobile app focused on incident management, resource coordination, and deployment
2. **Citizens** need a mobile app focused on alert tracking and evacuation information
3. Both mobile apps share common features with the web client but have non-overlapping specialized features
4. We need to avoid code duplication while maintaining app independence

This document captures the architectural decisions for building two React Native mobile applications that share code with the existing web client, covering repository structure, code sharing strategy, framework selection, and development workflow.

## Decision

### 1. Repository Structure: Monorepo with Workspaces

**Decision:** Adopt a monorepo structure with npm/yarn workspaces for code organization and sharing.

**Structure:**

```text
06/  (workspace root)
├── backend-app/              (existing - microservices)
├── client-app/               (existing - web React app)
├── responder-mobile-app/     (NEW - React Native / Expo)
├── citizen-mobile-app/       (NEW - React Native / Expo)
└── packages/                 (shared code)
    ├── @drccs/api-client/    (API services, hooks, adapters)
    └── @drccs/types/         (shared types, enums, interfaces)
```

**Rationale:**

- ✅ Single source of truth for shared code (API layer, types, validation)
- ✅ Automatic code sharing — changes to incident API benefit all apps immediately
- ✅ Easier collaboration — teams see shared code in single repository
- ✅ Consistent versioning and dependency management
- ✅ Bug fixes in API layer propagate to all platforms without manual duplication

**Alternative Considered:** Separate repositories for each app

- ❌ Would require manual code synchronization
- ❌ Increased risk of platform divergence
- ❌ Duplicate maintenance burden for shared features

---

### 2. Code Sharing Strategy: Tiered Packages

**Decision:** Extract and share code in two layers:

#### Layer 1: `@drccs/types` (Pure TypeScript types and enums)

Shared across all apps — zero app-specific logic.

**Contents:**

```typescript
// Types and interfaces
export interface Incident { id: string; status: IncidentStatus; ... }
export interface User { id: string; roles: Role[]; ... }
export interface Resource { id: string; availability: ResourceStatus; ... }

// Enums (shared constants)
export enum IncidentStatus { ACTIVE, RESOLVED, ARCHIVED }
export enum Role { RESPONDER, CITIZEN, ADMIN }
export enum ResourceStatus { AVAILABLE, IN_USE, MAINTENANCE }
```

#### Layer 2: `@drccs/api-client` (API services, React Query hooks, adapters)

Shared API infrastructure and data fetching patterns.

**Contents:**

```text
src/
├── services/
│   ├── base.ts                (HTTP client, error handling)
│   ├── incident.ts            (shared: web, responder, citizen)
│   ├── deploymentOrder.ts     (shared: web, responder)
│   ├── resource.ts            (shared: web, responder)
│   ├── responseUnit.ts        (shared: web, responder)
│   ├── notification.ts        (shared: all apps)
│   ├── user.ts                (shared: all apps)
│   └── deployment.ts          (shared: web, responder)
├── hooks/
│   ├── useIncident.ts
│   ├── useDeploymentOrder.ts
│   ├── useResources.ts
│   ├── useAuth.ts
│   └── ... (React Query hooks for data fetching)
├── adapters/
│   ├── incident.ts            (API → Display/Form conversions)
│   ├── resource.ts
│   └── ...
└── types/
    └── index.ts               (re-exports from @drccs/types)
```

**Package Dependencies:**

- `@drccs/api-client` depends on `@drccs/types`
- All apps depend on `@drccs/api-client` and `@drccs/types`

**Rationale:**

- ✅ Centralized API logic — one place to fix incident fetching bugs
- ✅ Type safety across all platforms
- ✅ React Query configured once, used everywhere
- ✅ Easy to add new API endpoints (service layer, then hook, then apps use it)

---

### 3. Feature Distribution

**Decision:** Each app includes only features relevant to its users.

**Web Client (client-app) — All features:**

- User Management (CRUD, roles)
- Incident Management (create, view, prioritize, assign)
- Resource Management (CRUD)
- Response Units (CRUD, availability)
- Departments & Municipalities (CRUD)
- Deployment Orders (create, assign, track)
- Dashboard & Analytics

**Responder Mobile App — Subset:**

- Dashboard (incident overview, key metrics)
- Incident Details (view, prioritize, mark resolved)
- Incident Deployment Orders (view, create, track resources)
- Resource Management (view, filter, check availability)
- Response Units (view, availability, coordination)
- Notifications (real-time alerts, assignments)
- **Mobile-specific:** GPS tracking, camera for documentation, offline support

**Citizen Mobile App — Different Subset:**

- Report Incident (create new incident with location & photos)
- Alert Center (receive emergency notifications)
- Evacuation Status (view evacuation zones, guidance)
- Notifications (push alerts for active incidents)
- **Mobile-specific:** Location sharing, emergency alert preferences

**Code Sharing:**

| Feature | Web | Responder | Citizen | Shared Package |
|---------|-----|-----------|---------|-----------------|
| Incident API | ✅ | ✅ | ✅ | Yes |
| Authentication | ✅ | ✅ | ✅ | Yes |
| Notifications | ✅ | ✅ | ✅ | Yes |
| User Management | ✅ | ❌ | ❌ | No |
| Deployment Orders | ✅ | ✅ | ❌ | Yes |
| Resource Mgmt | ✅ | ✅ | ❌ | Yes |

---

### 4. Framework Choice: Expo

**Decision:** Use Expo for both mobile apps.

**What is Expo?**

- Managed React Native platform that handles native compilation
- Write TypeScript/React → Expo compiles to iOS/Android apps
- No need to write Swift or Kotlin

**Rationale:**

| Aspect                         | Expo                       | Bare React Native       |
| ------------------------------ | -------------------------- | ----------------------- |
| **Setup Time**                 | 15 min                     | 2+ hours                |
| **Feature Coverage**           | 95%+ of common needs       | 100% with effort        |
| **Development Speed**          | Fast (hot refresh)         | Slower (rebuild)        |
| **CI/CD**                      | EAS Build (built-in)       | GitHub Actions + manual |
| **Learning Curve**             | Low                        | High (native code)      |
| **Team Skills**                | JavaScript/TypeScript only | +Swift/Kotlin needed    |
| **GPS, Camera, Notifications** | ✅ Built-in                | ✅ Built-in             |
| **Offline Support**            | ✅ Can use SQLite          | ✅ Can use SQLite       |
| **App Store Distribution**     | EAS Submit                 | Manual/Fastlane         |

**Expo Provides (out of the box):**

- ✅ GPS/Location (`expo-location`)
- ✅ Camera (`expo-camera`)
- ✅ Push Notifications (`expo-notifications` + Firebase)
- ✅ Background Tasks (`expo-task-manager`)
- ✅ Maps (`react-native-maps`)
- ✅ Offline Storage (`AsyncStorage`, `Secure Store`)
- ✅ WebSockets (for real-time updates)

**Escalation Path:** If future needs exceed Expo (e.g., custom Bluetooth module), use Expo Modules (managed native code integration).

**Alternative Considered:** Bare React Native

- ❌ More complex for current feature set
- ❌ Requires native developers (Swift/Kotlin)
- ❌ CI/CD significantly more complex
- ❌ Overkill for your use cases

---

### 5. UI Framework: React Native Paper (Material Design)

**Decision:** Use React Native Paper for UI components.

**What is React Native Paper?**

- Material Design component library for React Native
- Pre-built components: buttons, cards, modals, navigation, forms, etc.
- Consistent styling and theming

**Rationale:**

| Framework      | Alignment           | Components     | Theming   | Community |
| -------------- | ------------------- | -------------- | --------- | --------- |
| **Paper**      | Material Design     | Rich, polished | Excellent | Large     |
| **NativeBase** | Cross-platform      | Good           | Good      | Medium    |
| **Tamagui**    | Modern, web-aligned | Minimal        | Good      | Growing   |

**Chosen: Paper because:**

- ✅ Most polished Material Design implementation
- ✅ Rich component library (100+ components) — reduces custom code
- ✅ Android-first but works well on iOS
- ✅ Excellent theming for branding
- ✅ Large community → many examples

**Alternative Considered:** NativeBase

- Tailwind-like API (familiar to web team)
- Smaller component library
- Less polished feel

---

### 6. Navigation: React Navigation

**Decision:** Use React Navigation with bottom tabs for both mobile apps.

**Responder App Navigation:**

```text
Bottom Tabs:
├── Dashboard (Stack)
│   └── Incident Details
│       └── Deployment Orders
├── Incidents (Stack)
│   └── Incident Details
│       └── Deployment Orders
├── Resources (Stack)
│   └── Resource Details
├── Response Units (Stack)
│   └── Unit Details
└── Profile (Stack)
    └── Settings
```

**Citizen App Navigation:**

```text
Bottom Tabs:
├── Home (Stack)
│   └── Report Incident (modal)
├── Alerts (Stack)
│   └── Alert Details
├── Evacuations (Stack)
└── Profile (Stack)
    └── Preferences
```

**Rationale:**

- ✅ Standard mobile UX pattern (tab navigation)
- ✅ React Navigation is the de-facto standard for React Native
- ✅ Works seamlessly with Expo
- ✅ Extensive documentation and examples

---

### 7. State Management: React Query + Context API

**Decision:** Use React Query (from `@drccs/api-client`) + Context API for state management.

**Architecture:**

```typescript
// Server state: React Query (managed by @drccs/api-client hooks)
const { data: incidents, isLoading, error, refetch } = useIncidents();

// Client state: Context API
const { authState, setAuth } = useAuth();
const { notifications, addNotification } = useNotifications();
```

**Rationale:**

- ✅ React Query already used in web client — reuse expertise
- ✅ Excellent caching and synchronization for API data
- ✅ Automatic refetching, background updates
- ✅ Context API for simple app-wide state (auth, notifications)
- ✅ No additional dependency burden

**Alternative Considered:** Redux, MobX, Zustand

- Redux: Overkill for this scope; React Query + Context simpler
- MobX: Less common in React Native ecosystem
- Zustand: Good, but React Query already handles server state

---

### 8. Storage: AsyncStorage + Secure Store

**Decision:** Use AsyncStorage for general data and Secure Store for sensitive data (auth tokens).

**Rationale:**

```typescript
// Secure Storage: Auth tokens, refresh tokens, secrets
import * as SecureStore from "expo-secure-store";
await SecureStore.setItemAsync("auth_token", token);

// General Storage: User preferences, cache, metadata
import AsyncStorage from "@react-native-async-storage/async-storage";
await AsyncStorage.setItem("user_preferences", JSON.stringify(prefs));
```

- ✅ Secure Store: Platform-native encryption (Keychain on iOS, Keystore on Android)
- ✅ AsyncStorage: Fast, suitable for non-sensitive data
- ✅ Combination provides security + performance

---

### 9. CI/CD & Distribution: EAS Build

**Decision:** Use EAS Build for automated builds.

**Workflow:**

```text
Git push to main
  ↓
CI/CD pipeline triggers
  ↓
EAS Build creates iOS + Android APKs
  ↓
Tests run (unit, integration)
  ↓
On release
```

**Rationale:**

- ✅ EAS Build: Managed CI/CD, no Jenkins/GitHub Actions setup needed

---

### 10. Development Workflow

#### Phase 1: Monorepo Setup

1. Configure npm/yarn workspaces at repository root
2. Extract shared code: `@drccs/types`, `@drccs/api-client`
3. Update web client (`client-app`) to import from shared packages
4. Commit and validate web client still works

#### Phase 2: Responder App

1. Create `responder-mobile-app/` with Expo + TypeScript
2. Set up navigation (React Navigation)
3. Implement authentication flow
4. Build core screens (Dashboard, Incidents, Resources, Response Units)
5. Connect to shared API layer
6. Add real-time features (notifications, location)
7. Local testing → EAS Build → Alpha testing

#### Phase 3: Citizen App

1. Create `citizen-mobile-app/` with Expo + TypeScript
2. Follow same pattern as responder app
3. Implement citizen-specific screens (Report, My Incidents, Alerts)
4. Connect to shared API layer
5. Local testing → EAS Build → Alpha testing

#### Phase 4: Production Release

1. Configure EAS Submit
2. Build signed APKs/IPAs
3. Submit to Google Play and Apple App Store
4. Set up app store release workflow

---

### 11. Dependency Management

**Root `package.json` (workspaces):**

```json
{
  "name": "drccs-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "client-app",
    "responder-mobile-app",
    "citizen-mobile-app"
  ]
}
```

**`packages/@drccs/api-client/package.json`:**

```json
{
  "name": "@drccs/api-client",
  "version": "1.0.0",
  "dependencies": {
    "@drccs/types": "*",
    "axios": "^1.12.2",
    "@tanstack/react-query": "^5.90.5"
  }
}
```

**`responder-mobile-app/package.json`:**

```json
{
  "name": "responder-mobile-app",
  "version": "1.0.0",
  "dependencies": {
    "@drccs/api-client": "*",
    "@drccs/types": "*",
    "react-native": "^0.73.0",
    "expo": "^51.0.0",
    "react-native-paper": "^5.12.0",
    "@react-navigation/native": "^6.1.0"
  }
}
```

---

## Rationale

- **Code Reuse**: Shared types and API client prevent duplication and reduce maintenance burden (~40% code reduction)
- **Consistency**: Single source of truth for API contracts across all platforms (web, responder, citizen)
- **Scalability**: Monorepo enables teams to work independently while sharing infrastructure
- **Framework Choice**: Expo reduces time-to-market by eliminating native code requirements (95% feature coverage)
- **Type Safety**: TypeScript across all layers (API types, hooks, components) improves reliability
- **Maintainability**: Changes to incident API automatically benefit all apps immediately
- **Fast Development**: Expo provides managed CI/CD (EAS Build), hot refresh, and OTA updates
- **Mobile-First Features**: GPS, camera, push notifications available out-of-the-box

## Consequences

### Positive

- Single codebase for three apps reduces duplication by ~40%
- Changes to API client propagate automatically to all apps
- Shared types prevent API contract mismatches between platforms
- Faster development with Expo (no native compilation)
- Easier onboarding: all developers use TypeScript/React patterns
- Simplified CI/CD with monorepo tools and EAS Build
- Team autonomy: separate teams can work on responder/citizen apps without blocking
- Scalability: easy to add third mobile app later
- Automatic OTA updates via Expo for bug fixes

### Negative / Trade-offs

- **Increased complexity**: Monorepo requires discipline and tooling knowledge (workspaces, dependency management)
- **Larger repository**: Three apps in one repo increases clone and build times
- **Mobile-specific features**: Some native features still require platform-specific code
- **Expo limitations**: Some advanced native features not available (mitigated by Expo Modules)
- **Coordination overhead**: Teams must coordinate shared package changes
- **Slower initial setup**: 2-4 hours for monorepo scaffolding
- **Dependency conflicts**: If apps need conflicting versions of a library, more complex to resolve

## Alternatives Considered

### 1. Separate Repositories (One repo per app)

- **Pros**: Simpler CI/CD per app, independent versioning
- **Cons**: Code duplication for API layer, types, hooks; high divergence risk between platforms; maintenance burden × 3
- **Why not chosen**: Does not align with code reuse goals; high maintenance overhead

### 2. Bare React Native (Instead of Expo)

- **Pros**: Full native control, 100% feature coverage
- **Cons**: Requires Swift/Kotlin expertise; complex CI/CD setup; overkill for feature set
- **Why not chosen**: Team lacks native mobile expertise; current feature set fits within Expo's 95% coverage

### 3. Flutter (Different Framework)

- **Pros**: Single Dart codebase, fast performance
- **Cons**: Separate ecosystem from web client; no code sharing with React web app; team retraining required
- **Why not chosen**: No shared code with existing web client; entire team would need to learn Dart/Flutter

## Implementation Details

### Phase 1: Monorepo & Shared Packages

1. Configure npm/yarn workspaces at repository root
2. Create `packages/@drccs/types/` directory structure
3. Create `packages/@drccs/api-client/` directory structure
4. Migrate types from `client-app/src/types/` → `@drccs/types/`
5. Migrate API layer from `client-app/src/api/` → `@drccs/api-client/`
6. Migrate hooks from `client-app/src/hooks/` → `@drccs/api-client/`
7. Update `client-app/` imports to use shared packages
8. Test web client still builds and runs
9. Commit and document changes

### Phase 2: Responder App Setup

1. Create `responder-mobile-app/` with Expo + TypeScript
2. Set up React Navigation (bottom tabs + stacks)
3. Set up React Native Paper
4. Implement authentication flow
5. Build core screens (Dashboard, Incidents, Resources, Response Units)
6. Connect to shared API layer (`@drccs/api-client`)
7. Add real-time features (notifications via SSE fallback, location tracking)
8. Set up EAS Build configuration
9. Local testing → EAS Build → Alpha testing

### Phase 3: Citizen App Setup

1. Create `citizen-mobile-app/` with Expo + TypeScript
2. Follow same setup as responder app
3. Implement citizen-specific screens (Report Incident, Alerts, Evacuations)
4. Connect to shared API layer
5. Add mobile-specific features (location sharing, emergency alerts)
6. Local testing → EAS Build → Alpha testing

### Phase 4: Production Release

1. Configure EAS Submit for app stores
2. Build signed APKs/IPAs
3. Submit to Google Play and Apple App Store
4. Document release workflow and app store guidelines

### Mitigation Strategies for Trade-offs

- Document monorepo workflow (versioning, publishing) in CONTRIBUTING.md
- Use SemVer for shared packages to prevent breaking changes
- Test shared packages locally before publishing
- Plan Expo Modules upgrade path if native features needed
- Set up dependency conflict resolution guidelines

## Validation / Testing

Implementation will be validated through:

- **Type checking**: TypeScript strict mode across all packages
- **Integration tests**: Test shared packages with mock APIs
- **Unit tests**: Test API adapters, hooks, utility functions
- **Manual testing**: iOS/Android device testing for both mobile apps
- **Performance benchmarks**: App startup time, memory usage, API response times
- **Deployment validation**: Test CI/CD pipeline (EAS Build) for all three apps
- **Code review**: Ensure monorepo conventions followed

## References

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Monorepo Tools Comparison](https://monorepo.tools/)
- ADR_Frontend_Standards
- Example implementation: `responder-mobile-app/` and `citizen-mobile-app/`

---

**Originally Proposed By:** Frontend Architecture Team  
**Last Updated:** 2025-12-12
