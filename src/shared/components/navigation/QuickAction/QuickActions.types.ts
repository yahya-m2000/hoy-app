/**
 * QuickActions component types
 */

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  route: string;
  color?: string;
  testID?: string;
}

export interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  testID?: string;
}
