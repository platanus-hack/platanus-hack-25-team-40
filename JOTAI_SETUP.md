# Jotai + TanStack Query Setup

This project uses **Jotai** for state management and **TanStack Query** (via `jotai-tanstack-query`) for server state management.

## 📁 Project Structure

```
src/
├── modules/
│   └── health-records/          # Example feature module
│       ├── atoms/
│       │   ├── query-atoms.ts   # Query definitions with atomWithQuery
│       │   └── mutation-atoms.ts # Mutation definitions with atomWithMutation
│       ├── hooks/
│       │   ├── use-health-records-query.ts    # React hooks for queries
│       │   └── use-health-records-mutations.ts # React hooks for mutations
│       ├── gateways/
│       │   └── gateway-health-records.ts # Data access layer
│       └── types/
│           └── index.ts         # TypeScript types
├── shared/
│   ├── atoms/
│   │   └── gateway-atoms.ts     # Gateway instances as atoms (DI)
│   └── providers/
│       └── app-provider.tsx     # Jotai Provider + QueryClient setup
└── main.tsx                     # App entry with AppProvider
```

## 🚀 Quick Start

### 1. Use Queries (Fetching Data)

```tsx
import { useHealthRecordsList } from "@/modules/health-records/hooks/use-health-records-query";

function RecordsList() {
  const { data, isLoading, error } = useHealthRecordsList();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map(record => (
        <div key={record.id}>{record.title}</div>
      ))}
    </div>
  );
}
```

### 2. Use Mutations (Creating/Updating Data)

```tsx
import { useCreateHealthRecord } from "@/modules/health-records/hooks/use-health-records-mutations";

function CreateRecordForm() {
  const { createRecord, isLoading } = useCreateHealthRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRecord({
        patientId: "patient-1",
        category: "Cardiology",
        title: "Annual Checkup",
        date: new Date(),
      });
      // List queries will auto-refetch due to invalidation
    } catch (err) {
      console.error("Failed to create:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isLoading}>
        Create Record
      </button>
    </form>
  );
}
```

## 📚 Key Concepts

### Query Atoms
Define queries with `atomWithQuery`:
- Automatic caching
- Background refetching
- Loading/error states
- Dependent queries support

### Mutation Atoms
Define mutations with `atomWithMutation`:
- Optimistic updates
- Automatic cache invalidation
- Error handling
- Success callbacks

### Gateway Pattern
Data access layer separated from state management:
- Easy to mock for testing
- Centralized API logic
- Type-safe interfaces

## 🛠️ Creating a New Module

1. **Create types** in `src/modules/[feature]/types/index.ts`
2. **Create gateway** in `src/modules/[feature]/gateways/gateway-[feature].ts`
3. **Add gateway atom** in `src/shared/atoms/gateway-atoms.ts`
4. **Create query atoms** in `src/modules/[feature]/atoms/query-atoms.ts`
5. **Create mutation atoms** in `src/modules/[feature]/atoms/mutation-atoms.ts`
6. **Create hooks** in `src/modules/[feature]/hooks/`

## 🔧 Configuration

### Query Client Settings
Located in `src/shared/providers/app-provider.tsx`:
- `staleTime`: 5 minutes (how long data is considered fresh)
- `gcTime`: 15 minutes (how long to keep in cache)
- `refetchOnWindowFocus`: false
- `retry`: 1

### Cache Invalidation
Mutations automatically invalidate related queries:
```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["health-records", "list"] });
}
```

## 🐛 Debugging

React Query DevTools are enabled in development mode.
- Look for the floating icon in the bottom-right corner
- Click to open and inspect queries/mutations
- View cache state, refetch history, and more

## 📖 Additional Resources

- [Jotai Documentation](https://jotai.org/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [jotai-tanstack-query](https://jotai.org/docs/third-party/query)
