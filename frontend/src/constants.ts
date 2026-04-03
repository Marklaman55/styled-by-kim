export interface Service {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  image?: string;
  images?: string[];
  category?: any;
}

export const SERVICES: Service[] = [
  {
    id: 'classic',
    name: 'Classic Set',
    price: 3500,
    duration: '90 mins',
    description: 'A natural look that enhances your natural lashes by adding length and subtle volume.',
    image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'hybrid',
    name: 'Hybrid Set',
    price: 4500,
    duration: '120 mins',
    description: 'A mix of classic and volume lashes for a textured, wispy look. Perfect for those who want a bit more drama.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'volume',
    name: 'Volume Set',
    price: 5500,
    duration: '150 mins',
    description: 'Multiple lightweight lashes applied to each natural lash for a full, glamorous appearance.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'mega-volume',
    name: 'Mega Volume',
    price: 7000,
    duration: '180 mins',
    description: 'The ultimate lash transformation. Maximum density and drama for a bold, striking look.',
    image: 'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'removal',
    name: 'Lash Removal',
    price: 1000,
    duration: '30 mins',
    description: 'Safe and gentle removal of existing lash extensions without damaging your natural lashes.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
  }
];

export const TIME_SLOTS = [
  '08:00 AM', '09:30 AM', '11:00 AM', '12:30 PM', '02:00 PM', '03:30 PM', '05:00 PM'
];

export const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/katiani/800/600';
