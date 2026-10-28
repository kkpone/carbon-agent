import type { User } from '../services';

export function formatEmployInfo(item: User): string {
  const labels = [item.employName, item.employPhone, item.employEmail];
  const values = labels.filter(label => !!label);
  return values.join(' | ');
}
