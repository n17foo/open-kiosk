export type UserRole = 'admin' | 'manager' | 'cashier';

export type TabName = 'Order' | 'Scan' | 'Search' | 'More';

export type MoreMenuItem =
  | 'OrderHistory'
  | 'Settings'
  | 'Users'
  | 'Returns'
  | 'Printer'
  | 'PaymentTerminal'
  | 'SyncQueue'
  | 'Reports'
  | 'KioskConfig';

const TAB_ACCESS: Record<UserRole, TabName[]> = {
  admin: ['Order', 'Scan', 'Search', 'More'],
  manager: ['Order', 'Scan', 'Search', 'More'],
  cashier: ['Order', 'Scan', 'Search', 'More'],
};

const MORE_MENU_ACCESS: Record<UserRole, MoreMenuItem[]> = {
  admin: ['OrderHistory', 'Settings', 'Users', 'Returns', 'Printer', 'PaymentTerminal', 'SyncQueue', 'Reports', 'KioskConfig'],
  manager: ['OrderHistory', 'Settings', 'Returns', 'Printer', 'PaymentTerminal', 'SyncQueue', 'Reports'],
  cashier: ['OrderHistory', 'Printer', 'PaymentTerminal'],
};

export const canAccessTab = (role: UserRole | undefined, tab: TabName): boolean => {
  const effectiveRole: UserRole = role ?? 'cashier';
  return TAB_ACCESS[effectiveRole].includes(tab);
};

export const canAccessMoreMenuItem = (role: UserRole | undefined, item: MoreMenuItem): boolean => {
  const effectiveRole: UserRole = role ?? 'cashier';
  return MORE_MENU_ACCESS[effectiveRole].includes(item);
};
