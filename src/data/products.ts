import { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Grilled Chicken Rice",
    price: 10.99,
    image: "/assets/food/grilled-chicken.jpg",
    category: "Main Course",
    variants: [
      { name: "Regular", default: true },
      { name: "Large" },
      { name: "Extra Spicy" }
    ],
    additions: [
      { name: "Extra Chicken" },
      { name: "Extra Rice" }
    ]
  },
  {
    id: "2",
    name: "Classic Beef Burger",
    price: 12.99,
    image: "/assets/food/beef-burger.jpg",
    category: "Fast Food",
    variants: [
      { name: "Medium", default: true },
      { name: "Large" },
      { name: "Well Done" }
    ],
    additions: [
      { name: "Extra Cheese" },
      { name: "Bacon" }
    ]
  },
  {
    id: "3",
    name: "Veggie Salad",
    price: 8.50,
    image: "/assets/food/veggie-salad.jpg",
    category: "Healthy",
    variants: [
      { name: "Regular", default: true },
      { name: "Large" }
    ],
    additions: [
      { name: "Avocado" },
      { name: "Extra Dressing" }
    ]
  },
  {
    id: "4",
    name: "Iced Americano",
    price: 4.50,
    image: "/assets/food/iced-americano.jpg",
    category: "Beverages",
    variants: [
      { name: "Small" },
      { name: "Medium", default: true },
      { name: "Large" }
    ],
    additions: [
      { name: "Extra Shot" },
      { name: "Sugar Syrup" }
    ]
  },
  {
    id: "5",
    name: "Chocolate Brownie",
    price: 5.99,
    image: "/assets/food/chocolate-brownie.jpg",
    category: "Desserts",
    variants: [
      { name: "Regular", default: true },
      { name: "With Ice Cream" }
    ],
    additions: [
      { name: "Extra Chocolate" },
      { name: "Nuts" }
    ]
  },
  {
    id: "6",
    name: "Pepperoni Pizza",
    price: 14.99,
    image: "/assets/food/pepperoni-pizza.jpg",
    category: "Fast Food",
    variants: [
      { name: "Medium", default: true },
      { name: "Large" },
      { name: "Thin Crust" }
    ],
    additions: [
      { name: "Extra Cheese" },
      { name: "Extra Pepperoni" }
    ]
  },
  {
    id: "7",
    name: "Fresh Fruit Smoothie",
    price: 6.50,
    image: "/assets/food/fruit-smoothie.jpg",
    category: "Beverages",
    variants: [
      { name: "Small" },
      { name: "Medium", default: true },
      { name: "Large" }
    ],
    additions: [
      { name: "Protein Boost" },
      { name: "Chia Seeds" }
    ]
  },
  {
    id: "8",
    name: "Fish & Chips",
    price: 11.50,
    image: "/assets/food/fish-chips.jpg",
    category: "Main Course",
    variants: [
      { name: "Regular", default: true },
      { name: "Large" }
    ],
    additions: [
      { name: "Extra Sauce" },
      { name: "Extra Fries" }
    ]
  }
];

export const categories = [
  "All",
  "Main Course",
  "Fast Food",
  "Healthy",
  "Beverages",
  "Desserts"
];