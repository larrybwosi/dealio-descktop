import { Customer } from '../types';

export const customers: Customer[] = [
  {
    id: '1',
    name: 'Antonio Erlangga',
    email: 'antonioer@gmail.com',
    phone: '+62812345678',
    address: 'Jl. Indah Kapuk No. 123, Jakarta',
    loyaltyPoints: 150,
    lastVisit: '2025-07-15',
    orderHistory: ['#11EFA-3D', '#12DDB-3C'],
    notes: 'Prefers spicy food'
  },
  {
    id: '2',
    name: 'Sherlina Putri',
    email: 'sherlinaputri@gmail.com',
    phone: '+62898765432',
    address: 'Jl. Mawar No. 45, Jakarta Selatan',
    loyaltyPoints: 85,
    lastVisit: '2025-07-08',
    orderHistory: ['#10CDB-2A'],
    notes: 'Allergic to seafood'
  },
  {
    id: '3',
    name: 'Devano Cahyo Anggara',
    email: 'devano.ca@example.com',
    phone: '+6285712345678',
    address: 'Jl. Merdeka No. 78, Jakarta Pusat',
    loyaltyPoints: 220,
    lastVisit: '2025-07-19',
    orderHistory: ['#12DDB-3A', '#10CFA-1B'],
    notes: 'Regular customer, likes table near window'
  },
  {
    id: '4',
    name: 'Dwi Lestari Salsabila',
    email: 'dwilestari@example.com',
    phone: '+6281987654321',
    address: 'Jl. Kenanga No. 15, Jakarta Timur',
    loyaltyPoints: 65,
    lastVisit: '2025-07-10',
    orderHistory: ['#12DDB-3A'],
    notes: ''
  },
  {
    id: '5',
    name: 'Anggito Dwi Pratama',
    email: 'anggito.dp@example.com',
    phone: '+6282187654321',
    address: 'Jl. Dahlia No. 29, Jakarta Barat',
    loyaltyPoints: 110,
    lastVisit: '2025-07-20',
    orderHistory: ['#12DDB-3A', '#11BCA-4D'],
    notes: 'Prefers non-spicy options'
  }
];