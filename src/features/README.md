# Features Directory

This directory contains feature-based modules. Each feature should be self-contained with its own components, hooks, and logic.

## Structure Example

```
features/
├── authentication/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── index.ts
├── projects/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── index.ts
└── dashboard/
    ├── components/
    ├── hooks/
    └── index.ts
```

## Guidelines

- Each feature is self-contained
- Export public API through index.ts
- Keep feature-specific code within its directory
- Share common utilities through src/utils
