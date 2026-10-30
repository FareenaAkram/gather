export const CATEGORIES = [
  { id: 'tech', label: 'Tech', color: '#8b7cf6' },
  { id: 'art', label: 'Art & Culture', color: '#ff5a36' },
  { id: 'outdoors', label: 'Outdoors', color: '#34b98a' },
  { id: 'social', label: 'Social', color: '#f5a524' },
  { id: 'wellness', label: 'Wellness', color: '#2bb3c0' },
  { id: 'learning', label: 'Learning', color: '#e5488a' },
];

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) || null;
}
