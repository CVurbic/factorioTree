import type { Recipe } from '../types'

export const recipes: Recipe[] = [
  {
    id: 'inserter',
    name: 'Inserter',
    ingredients: [
      { id: 'electronic-circuit', name: 'Electronic Circuit', amount: 1 },
      { id: 'iron-gear-wheel', name: 'Iron Gear Wheel', amount: 1 },
      { id: 'iron-plate', name: 'Iron Plate', amount: 1 },
    ],
  },
  {
    id: 'electronic-circuit',
    name: 'Electronic Circuit',
    ingredients: [
      { id: 'iron-plate', name: 'Iron Plate', amount: 1 },
      { id: 'copper-cable', name: 'Copper Cable', amount: 3 },
    ],
  },
  {
    id: 'iron-gear-wheel',
    name: 'Iron Gear Wheel',
    ingredients: [
      { id: 'iron-plate', name: 'Iron Plate', amount: 2 },
    ],
  },
  {
    id: 'copper-cable',
    name: 'Copper Cable',
    ingredients: [
      { id: 'copper-plate', name: 'Copper Plate', amount: 1 },
    ],
  },
  {
    id: 'iron-plate',
    name: 'Iron Plate',
    ingredients: [],
  },
  {
    id: 'copper-plate',
    name: 'Copper Plate',
    ingredients: [],
  },
]

export const craftableItems = recipes.filter(r => r.ingredients.length > 0)
