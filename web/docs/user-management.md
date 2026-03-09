# User Management

This document describes the user management features and restrictions in the application.

## User Roles

The application supports different user roles with varying permissions:

- **Admin**: Full system access with certain restrictions
- **User**: Standard user access

## Delete Restrictions

### Admin Users
- **Can edit all users**: Admin users have full edit permissions for all user accounts
- **Can delete regular users**: Admin users can delete users with "user" role
- **Cannot delete admin users**: Admin users cannot delete other admin accounts (including themselves)
- **Cannot be deleted**: Admin user accounts cannot be deleted by any user
- **Visual indication**: When delete is disabled, a grayed-out "Hapus" option appears with a tooltip explaining the restriction

### Regular Users
- **Can delete other regular users**: Users with "user" role can delete other users with "user" role
- **Cannot delete admin users**: Regular users cannot delete admin accounts

## Implementation Details

### User Table (`src/pages/user/user-table.tsx`)
- Uses `useUserColumns()` hook to get dynamic columns based on current user role
- Integrates with authentication store to check current user permissions

### User Columns (`src/pages/user/user-columns.tsx`)
- `useUserColumns()` hook checks current user role from authentication store
- Conditionally disables delete action based on user roles
- Provides reason for disabled delete action

### Data Table Row Actions (`src/components/ui/table/data-table-row-actions.tsx`)
- Accepts `deleteDisabledReason` prop to show tooltip for disabled delete
- Shows grayed-out delete option when disabled
- Maintains consistent UI/UX across the application

## Usage Example

```typescript
// In user columns
const columns = useUserColumns(); // Automatically handles role-based restrictions

// The delete action will be automatically disabled for:
// 1. Admin users (they cannot delete any users)
// 2. Admin user accounts (they cannot be deleted)
```

## Security Considerations

- Role-based access control is enforced at the UI level
- Server-side validation should also be implemented to prevent unauthorized deletions
- User role information is stored in the authentication store
- Delete restrictions are applied consistently across all user management interfaces

## Future Enhancements

- Add role-based editing restrictions
- Implement audit logging for user management actions
- Add bulk delete functionality with role-based restrictions
- Enhanced tooltips and user feedback for restricted actions 