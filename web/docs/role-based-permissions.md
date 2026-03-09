# Role-Based Permissions System

This document describes the role-based permissions system implemented in the application to control user access to various features and actions.

## Overview

The role-based permissions system provides granular control over what users can do based on their assigned role. This ensures security and proper access control across the application.

## User Roles

### Admin Role
- **Full access** to most features
- **Can perform**: Edit, Delete, Import, Add, View
- **Special restrictions**: 
  - Cannot delete admin user accounts (including themselves)
  - Admin accounts cannot be deleted by anyone

### User Role
- **Limited access** - read-only for most features
- **Can perform**: View only
- **Cannot perform**: Edit, Delete, Import, Add

## Permission Matrix

| Action | Admin | User |
|--------|-------|------|
| View Records | ✅ | ✅ |
| Add Records | ✅ | ❌ |
| Edit Records | ✅ | ❌ |
| Delete Records | ✅ | ❌ |
| Import Data | ✅ | ❌ |

## Implementation Details

### Core Utilities (`src/lib/role-permissions.ts`)

#### `useRolePermissions()`
Returns a `RolePermissions` object with boolean flags for each permission:

```typescript
interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canImport: boolean;
  canAdd: boolean;
  canView: boolean;
}
```

#### `usePermission(permission)`
Returns a specific permission boolean:

```typescript
const canEdit = usePermission('canEdit');
```

#### `useRowActionRestrictions()`
Returns restrictions for DataTableRowActions:

```typescript
const { disableEdit, disableDelete, editDisabledReason, deleteDisabledReason } = useRowActionRestrictions();
```

### Usage Examples

#### In Table Columns
```typescript
// Convert static columns to hook-based columns
export const useCustomerColumns = (): Array<ColumnDef<Customer>> => {
  const { disableEdit, disableDelete, editDisabledReason, deleteDisabledReason } = useRowActionRestrictions();
  
  return [
    // ... other columns
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          disableEdit={disableEdit}
          disableDelete={disableDelete}
          editDisabledReason={editDisabledReason}
          deleteDisabledReason={deleteDisabledReason}
        />
      ),
    },
  ];
};
```

#### In Table Components
```typescript
export default function CustomerTable() {
  const columns = useCustomerColumns(); // Automatically applies role restrictions
  
  return (
    <DataTable
      data={data?.result || []}
      columns={columns}
      // ... other props
    />
  );
}
```

#### In Header Components
```typescript
export default function DataTableHeader({ addAction, importAction }) {
  const { canAdd, canImport } = useRolePermissions();
  
  return (
    <div>
      {addAction && canAdd && (
        <Button onClick={addAction}>Add</Button>
      )}
      {importAction && canImport && (
        <Button onClick={importAction}>Import</Button>
      )}
    </div>
  );
}
```

## Components Updated

### 1. DataTableRowActions (`src/components/ui/table/data-table-row-actions.tsx`)
- Added `editDisabledReason` prop
- Shows disabled state for both edit and delete actions
- Displays tooltips with reasons for disabled actions

### 2. DataTableHeader (`src/components/ui/table/data-table-header.tsx`)
- Conditionally shows Add and Import buttons based on user permissions
- Uses `useRolePermissions()` hook for permission checks

### 3. Table Columns
- **User Columns** (`src/pages/user/user-columns.tsx`): Special rules for user management
- **Customer Columns** (`src/pages/customer/customer-columns.tsx`): Standard role restrictions
- **Delivery Columns** (`src/pages/delivery/delivery-columns.tsx`): Standard role restrictions

### 4. Table Components
- **User Table** (`src/pages/user/user-table.tsx`): Uses `useUserColumns()`
- **Customer Table** (`src/pages/customer/customer-table.tsx`): Uses `useCustomerColumns()`
- **Delivery Table** (`src/pages/delivery/delivery-table.tsx`): Uses `useDeliveryColumns()`

## Visual Feedback

### Disabled Actions
- **Grayed-out appearance**: Disabled actions appear in muted colors
- **Tooltips**: Hover over disabled actions to see the reason
- **Consistent styling**: All disabled actions follow the same visual pattern

### User Experience
- **Clear feedback**: Users understand why actions are disabled
- **No broken functionality**: Disabled actions don't trigger errors
- **Consistent behavior**: Same restrictions apply across all interfaces

## Security Considerations

### Client-Side Protection
- **UI-level restrictions**: Actions are hidden/disabled based on user role
- **Clear feedback**: Users understand access limitations
- **Consistent enforcement**: Same rules apply everywhere

### Server-Side Validation
- **Always implement server-side validation** to complement client-side restrictions
- **Never rely solely on client-side restrictions** for security
- **Validate user permissions** on every API call

## Extending the System

### Adding New Permissions
1. Update the `RolePermissions` interface
2. Add permission to the permissions object in `useRolePermissions()`
3. Create a new `usePermission()` hook call if needed
4. Update components to use the new permission

### Adding New Roles
1. Add the new role to the permissions object in `useRolePermissions()`
2. Define appropriate permissions for the new role
3. Update documentation and user guides

### Special Cases
For components with special requirements (like user management), combine role-based restrictions with component-specific logic:

```typescript
// Example: User management with special rules
const finalDisableEdit = disableEdit || isCurrentUserAdmin;
const finalDisableDelete = disableDelete || isCurrentUserAdmin || isRowUserAdmin;
```

## Best Practices

1. **Always use the permission hooks** instead of hardcoding role checks
2. **Provide clear feedback** when actions are disabled
3. **Maintain consistency** across all interfaces
4. **Document special cases** and their reasoning
5. **Test with different user roles** to ensure proper restrictions
6. **Implement server-side validation** for all restricted actions

## Future Enhancements

- **Dynamic permissions**: Load permissions from server
- **Permission groups**: Group related permissions together
- **Audit logging**: Track permission-based actions
- **Granular permissions**: More specific permission types
- **Role inheritance**: Hierarchical role system 