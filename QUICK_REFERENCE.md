# Quick Reference Guide

## 🚀 Common Imports

### Services
```typescript
// Authentication
import { authService } from '@/services/auth.service';
await authService.login({ email, password });
await authService.register({ username, email, password, role });
await authService.logout();

// Projects
import { projectService } from '@/services/project.service';
const projects = await projectService.getAll();
const project = await projectService.getById(id);
await projectService.create(data);

// Contractors
import { contractorService } from '@/services/contractor.service';
const contractors = await contractorService.getAll();
const posts = await contractorService.getPosts(contractorId);

// Quotes
import { quoteService } from '@/services/quote.service';
const quotes = await quoteService.getByProject(projectId);
await quoteService.send(quoteId);

// Contracts
import { contractService } from '@/services/contract.service';
await contractService.sign(contractId, signature);

// Chat
import { chatService } from '@/services/chat.service';
const messages = await chatService.getMessages(projectId);

// 3D Models
import { modelService } from '@/services/model.service';
await modelService.upload(projectId, file);
const elements = await modelService.getElements(modelId);

// Supervisors
import { supervisorService } from '@/services/supervisor.service';
await supervisorService.createInspection(data);
```

### Utilities
```typescript
// Date formatting
import { formatDate, getRelativeTime, getDaysBetween } from '@/utils/date.utils';
formatDate(new Date(), 'short'); // "01/15/2024"
getRelativeTime(date); // "2 hours ago"

// Number/Currency formatting
import { formatCurrency, formatNumber, formatFileSize } from '@/utils/format.utils';
formatCurrency(1000000, 'VND'); // "₫1,000,000"
formatFileSize(1024); // "1 KB"

// Validation
import { isValidEmail, validatePasswordStrength } from '@/utils/validation.utils';
isValidEmail('test@example.com'); // true

// Storage
import { getLocalStorage, setLocalStorage } from '@/utils/storage.utils';
setLocalStorage('user', userObject);
const user = getLocalStorage('user');

// Arrays
import { unique, groupBy, sortBy } from '@/utils/array.utils';
const uniqueItems = unique([1, 2, 2, 3]);
```

### Constants
```typescript
// Routes
import { PROJECT_ROUTES, AUTH_ROUTES } from '@/constants/routes.constants';
router.push(PROJECT_ROUTES.DETAIL(projectId));
router.push(AUTH_ROUTES.LOGIN);

// Statuses
import { PROJECT_STATUS, QUOTE_STATUS } from '@/constants/status.constants';
if (project.status === PROJECT_STATUS.IN_PROGRESS) { ... }

// Roles & Permissions
import { USER_ROLES, hasPermission, PERMISSIONS } from '@/constants/roles.constants';
if (user.role === USER_ROLES.CONTRACTOR) { ... }
if (hasPermission(role, PERMISSIONS.PROJECT_CREATE)) { ... }

// App config
import { FILE_UPLOAD, PAGINATION } from '@/constants';
const maxSize = FILE_UPLOAD.MAX_SIZE_MB;
```

### Types
```typescript
import type {
  Project,
  User,
  ProjectStatus,
  UserRole
} from '@/types';

// Or specific imports
import type { Project } from '@/types/project.types';
import type { User } from '@/types/user.types';
```

### Validators
```typescript
// Auth validation
import { validateLogin, validateRegister } from '@/validators/auth.validators';
const validation = validateLogin({ email, password });
if (!validation.isValid) {
  setErrors(validation.errors);
}

// Project validation
import { validateProject } from '@/validators/project.validators';
const validation = validateProject(projectData);

// Quote validation
import { validateQuote } from '@/validators/quote.validators';
const validation = validateQuote(quoteData);
```

### Config
```typescript
import { config, isDevelopment, isProduction } from '@/config';

config.apiUrl; // API base URL
config.features.chat; // Feature flag
config.debugMode; // Debug mode
```

## 🎨 Code Patterns

### API Service Pattern
```typescript
export const featureService = {
  getAll: async (): Promise<Feature[]> => {
    const response = await apiClient.get('/features');
    return response.data;
  },

  getById: async (id: string): Promise<Feature> => {
    const response = await apiClient.get(`/features/${id}`);
    return response.data;
  },

  create: async (data: CreateFeatureData): Promise<Feature> => {
    const response = await apiClient.post('/features', data);
    return response.data;
  },
};
```

### Validator Pattern
```typescript
export const validateFeature = (data: FeatureData): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmpty(data.name)) {
    errors.name = 'Name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

### Utility Function Pattern
```typescript
export const utilityFunction = (input: string): string => {
  // Pure function, no side effects
  return input.toUpperCase();
};
```

## 📋 File Templates

### New Service
```typescript
// src/services/feature.service.ts
import apiClient from '@/lib/api/client';

export interface Feature {
  id: string;
  name: string;
}

export const featureService = {
  getAll: async (): Promise<Feature[]> => {
    const response = await apiClient.get('/features');
    return response.data;
  },
};
```

### New Type
```typescript
// src/types/feature.types.ts
import { EntityWithMetadata } from './common.types';

export interface Feature extends EntityWithMetadata {
  name: string;
  description: string;
  status: FeatureStatus;
}

export type FeatureStatus = 'active' | 'inactive';
```

### New Constant
```typescript
// src/constants/feature.constants.ts
export const FEATURE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const FEATURE_STATUS_LABELS = {
  [FEATURE_STATUS.ACTIVE]: 'Active',
  [FEATURE_STATUS.INACTIVE]: 'Inactive',
} as const;
```

### New Validator
```typescript
// src/validators/feature.validators.ts
import { isEmpty } from '@/utils/validation.utils';

export const validateFeature = (data: {
  name: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (isEmpty(data.name)) {
    errors.name = 'Name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

## 🔧 Common Tasks

### Making an API Call
```typescript
import { projectService } from '@/services';

const fetchProjects = async () => {
  try {
    const projects = await projectService.getAll();
    setProjects(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
};
```

### Validating a Form
```typescript
import { validateLogin } from '@/validators';

const handleSubmit = async (e) => {
  e.preventDefault();

  const validation = validateLogin({ email, password });
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  // Proceed with submission
};
```

### Formatting Data
```typescript
import { formatDate, formatCurrency } from '@/utils';

const displayProject = (project) => ({
  ...project,
  formattedDate: formatDate(project.createdAt, 'long'),
  formattedBudget: formatCurrency(project.budget, 'VND'),
});
```

### Using Constants
```typescript
import { PROJECT_STATUS, PROJECT_STATUS_LABELS } from '@/constants';

const statusLabel = PROJECT_STATUS_LABELS[project.status];
const isActive = project.status === PROJECT_STATUS.IN_PROGRESS;
```

## 💡 Best Practices

1. **Always use services for API calls** - Never use apiClient directly in components
2. **Import from index files** - `from '@/services'` not `from '@/services/auth.service'`
3. **Use constants** - Never hardcode status strings or routes
4. **Validate forms** - Use validators for all user input
5. **Type everything** - Import types and use them
6. **Use utility functions** - Don't reinvent the wheel
7. **Follow the patterns** - Be consistent with existing code

## 🎯 Quick Checklist

When creating a new feature:
- [ ] Create service in `/services`
- [ ] Add types in `/types`
- [ ] Define constants in `/constants`
- [ ] Create validator if needed
- [ ] Build components
- [ ] Add pages
- [ ] Update exports in index files
- [ ] Test thoroughly

## 📚 Documentation Links

- Full architecture: See `ARCHITECTURE.md`
- Migration guide: See `MIGRATION_GUIDE.md`
- Scaling summary: See `SCALING_SUMMARY.md`
