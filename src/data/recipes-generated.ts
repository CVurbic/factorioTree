// AUTO-GENERATED — do not edit. Run: node scripts/generate-recipes.mjs

export interface Ingredient {
  id: string
  name: string
  amount: number
  type: 'item' | 'fluid'
}

export interface Recipe {
  id: string
  name: string
  resultAmount: number
  ingredients: Ingredient[]
  group: string
  craftingTime: number
  isFluid: boolean
  subgroup: string
  subgroupOrder: string
  itemOrder: string
}

export interface ItemGroup {
  id: string
  name: string
  order: string
}

export const itemGroups: ItemGroup[] = [
  {
    "id": "logistics",
    "name": "Logistics",
    "order": "a"
  },
  {
    "id": "production",
    "name": "Production",
    "order": "b"
  },
  {
    "id": "intermediate-products",
    "name": "Intermediate products",
    "order": "c"
  },
  {
    "id": "space",
    "name": "Space",
    "order": "d"
  },
  {
    "id": "combat",
    "name": "Combat",
    "order": "e"
  },
  {
    "id": "fluids",
    "name": "Fluids",
    "order": "f"
  },
  {
    "id": "signals",
    "name": "Signals",
    "order": "g"
  }
]

export const recipes: Recipe[] = [
  {
    "id": "speed-module",
    "name": "Speed Module",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "a[speed]-a[speed-module-1]"
  },
  {
    "id": "speed-module-2",
    "name": "Speed Module 2",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "speed-module",
        "name": "Speed Module",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "a[speed]-b[speed-module-2]"
  },
  {
    "id": "speed-module-3",
    "name": "Speed Module 3",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "speed-module-2",
        "name": "Speed Module 2",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "tungsten-carbide",
        "name": "Tungsten Carbide",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 60,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "a[speed]-c[speed-module-3]"
  },
  {
    "id": "productivity-module",
    "name": "Productivity Module",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "c[productivity]-a[productivity-module-1]"
  },
  {
    "id": "productivity-module-2",
    "name": "Productivity Module 2",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "productivity-module",
        "name": "Productivity Module",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "c[productivity]-b[productivity-module-2]"
  },
  {
    "id": "productivity-module-3",
    "name": "Productivity Module 3",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "productivity-module-2",
        "name": "Productivity Module 2",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "biter-egg",
        "name": "Biter Egg",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 60,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "c[productivity]-c[productivity-module-3]"
  },
  {
    "id": "efficiency-module",
    "name": "Efficiency Module",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "c[efficiency]-a[efficiency-module-1]"
  },
  {
    "id": "efficiency-module-2",
    "name": "Efficiency Module 2",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "efficiency-module",
        "name": "Efficiency Module",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "c[efficiency]-b[efficiency-module-2]"
  },
  {
    "id": "efficiency-module-3",
    "name": "Efficiency Module 3",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "efficiency-module-2",
        "name": "Efficiency Module 2",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "spoilage",
        "name": "Spoilage",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 60,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "c[efficiency]-c[efficiency-module-3]"
  },
  {
    "id": "bulk-inserter",
    "name": "Bulk Inserter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "fast-inserter",
        "name": "Fast Inserter",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "inserter",
    "subgroupOrder": "c",
    "itemOrder": "f[bulk-inserter]"
  },
  {
    "id": "petroleum-gas",
    "name": "Petroleum Gas",
    "resultAmount": 45,
    "ingredients": [
      {
        "id": "crude-oil",
        "name": "Crude Oil",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 5,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "a[fluid]-b[oil]-b[petroleum-gas]"
  },
  {
    "id": "heavy-oil",
    "name": "Heavy Oil",
    "resultAmount": 25,
    "ingredients": [
      {
        "id": "water",
        "name": "Water",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "crude-oil",
        "name": "Crude Oil",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 5,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "a[fluid]-b[oil]-d[heavy-oil]"
  },
  {
    "id": "light-oil",
    "name": "Light Oil",
    "resultAmount": 30,
    "ingredients": [
      {
        "id": "water",
        "name": "Water",
        "amount": 30,
        "type": "fluid"
      },
      {
        "id": "heavy-oil",
        "name": "Heavy Oil",
        "amount": 40,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 2,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "a[fluid]-b[oil]-c[light-oil]"
  },
  {
    "id": "sulfuric-acid",
    "name": "Sulfuric Acid",
    "resultAmount": 50,
    "ingredients": [
      {
        "id": "sulfur",
        "name": "Sulfur",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 1,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "a[fluid]-b[oil]-f[sulfuric-acid]"
  },
  {
    "id": "plastic-bar",
    "name": "Plastic Bar",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "petroleum-gas",
        "name": "Petroleum Gas",
        "amount": 20,
        "type": "fluid"
      },
      {
        "id": "coal",
        "name": "Coal",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "b[chemistry]-b[plastic-bar]"
  },
  {
    "id": "solid-fuel",
    "name": "Solid Fuel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "light-oil",
        "name": "Light Oil",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "b[chemistry]-a[solid-fuel]"
  },
  {
    "id": "sulfur",
    "name": "Sulfur",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "water",
        "name": "Water",
        "amount": 30,
        "type": "fluid"
      },
      {
        "id": "petroleum-gas",
        "name": "Petroleum Gas",
        "amount": 30,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "b[chemistry]-c[sulfur]"
  },
  {
    "id": "lubricant",
    "name": "Lubricant",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "heavy-oil",
        "name": "Heavy Oil",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 1,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "a[fluid]-b[oil]-e[lubricant]"
  },
  {
    "id": "barrel",
    "name": "Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "a[basic-intermediates]-d[empty-barrel]"
  },
  {
    "id": "night-vision-equipment",
    "name": "Night Vision Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "utility-equipment",
    "subgroupOrder": "f",
    "itemOrder": "f[night-vision]-a[night-vision-equipment]"
  },
  {
    "id": "belt-immunity-equipment",
    "name": "Belt Immunity Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "utility-equipment",
    "subgroupOrder": "f",
    "itemOrder": "c[belt-immunity]-a[belt-immunity]"
  },
  {
    "id": "energy-shield-equipment",
    "name": "Energy Shield Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "military-equipment",
    "subgroupOrder": "g",
    "itemOrder": "a[shield]-a[energy-shield-equipment]"
  },
  {
    "id": "energy-shield-mk2-equipment",
    "name": "Energy Shield Mk2 Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "energy-shield-equipment",
        "name": "Energy Shield Equipment",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "military-equipment",
    "subgroupOrder": "g",
    "itemOrder": "a[shield]-b[energy-shield-equipment-mk2]"
  },
  {
    "id": "battery-equipment",
    "name": "Battery Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "battery",
        "name": "Battery",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "equipment",
    "subgroupOrder": "e",
    "itemOrder": "b[battery]-a[battery-equipment]"
  },
  {
    "id": "battery-mk2-equipment",
    "name": "Battery Mk2 Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "battery-equipment",
        "name": "Battery Equipment",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "equipment",
    "subgroupOrder": "e",
    "itemOrder": "b[battery]-b[battery-equipment-mk2]"
  },
  {
    "id": "solar-panel-equipment",
    "name": "Solar Panel Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "solar-panel",
        "name": "Solar Panel",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "equipment",
    "subgroupOrder": "e",
    "itemOrder": "a[energy-source]-a[solar-panel]"
  },
  {
    "id": "fission-reactor-equipment",
    "name": "Fission Reactor Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 200,
        "type": "item"
      },
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "uranium-fuel-cell",
        "name": "Uranium Fuel Cell",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "equipment",
    "subgroupOrder": "e",
    "itemOrder": "a[energy-source]-b[fission-reactor]"
  },
  {
    "id": "personal-laser-defense-equipment",
    "name": "Personal Laser Defense Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "laser-turret",
        "name": "Laser Turret",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "military-equipment",
    "subgroupOrder": "g",
    "itemOrder": "b[active-defense]-a[personal-laser-defense-equipment]"
  },
  {
    "id": "discharge-defense-equipment",
    "name": "Discharge Defense Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "laser-turret",
        "name": "Laser Turret",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "military-equipment",
    "subgroupOrder": "g",
    "itemOrder": "b[active-defense]-b[discharge-defense-equipment]-a[equipment]"
  },
  {
    "id": "exoskeleton-equipment",
    "name": "Exoskeleton Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 30,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "utility-equipment",
    "subgroupOrder": "f",
    "itemOrder": "d[exoskeleton]-a[exoskeleton-equipment]"
  },
  {
    "id": "personal-roboport-equipment",
    "name": "Personal Roboport Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "battery",
        "name": "Battery",
        "amount": 45,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "utility-equipment",
    "subgroupOrder": "f",
    "itemOrder": "e[robotics]-a[personal-roboport-equipment]"
  },
  {
    "id": "personal-roboport-mk2-equipment",
    "name": "Personal Roboport Mk2 Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "personal-roboport-equipment",
        "name": "Personal Roboport Equipment",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 50,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "utility-equipment",
    "subgroupOrder": "f",
    "itemOrder": "e[robotics]-b[personal-roboport-mk2-equipment]"
  },
  {
    "id": "laser-turret",
    "name": "Laser Turret",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "battery",
        "name": "Battery",
        "amount": 12,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "turret",
    "subgroupOrder": "i",
    "itemOrder": "b[turret]-b[laser-turret]"
  },
  {
    "id": "flamethrower-turret",
    "name": "Flamethrower Turret",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 30,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "engine-unit",
        "name": "Engine Unit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "turret",
    "subgroupOrder": "i",
    "itemOrder": "b[turret]-c[flamethrower-turret]"
  },
  {
    "id": "artillery-turret",
    "name": "Artillery Turret",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 60,
        "type": "item"
      },
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 60,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 40,
    "isFluid": false,
    "subgroup": "turret",
    "subgroupOrder": "i",
    "itemOrder": "b[turret]-d[artillery-turret]-a[turret]"
  },
  {
    "id": "gun-turret",
    "name": "Gun Turret",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "turret",
    "subgroupOrder": "i",
    "itemOrder": "b[turret]-a[gun-turret]"
  },
  {
    "id": "wooden-chest",
    "name": "Wooden Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "wood",
        "name": "Wood",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "storage",
    "subgroupOrder": "a",
    "itemOrder": "a[items]-a[wooden-chest]"
  },
  {
    "id": "display-panel",
    "name": "Display Panel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "circuit-network",
    "subgroupOrder": "h",
    "itemOrder": "s[display-panel]"
  },
  {
    "id": "iron-stick",
    "name": "Iron Stick",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "a[basic-intermediates]-b[iron-stick]"
  },
  {
    "id": "stone-furnace",
    "name": "Stone Furnace",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "stone",
        "name": "Stone",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "smelting-machine",
    "subgroupOrder": "d",
    "itemOrder": "a[stone-furnace]"
  },
  {
    "id": "boiler",
    "name": "Boiler",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "stone-furnace",
        "name": "Stone Furnace",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "b[steam-power]-a[boiler]"
  },
  {
    "id": "steam-engine",
    "name": "Steam Engine",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "b[steam-power]-b[steam-engine]"
  },
  {
    "id": "iron-gear-wheel",
    "name": "Iron Gear Wheel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "a[basic-intermediates]-a[iron-gear-wheel]"
  },
  {
    "id": "electronic-circuit",
    "name": "Electronic Circuit",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 3,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "b[circuits]-a[electronic-circuit]"
  },
  {
    "id": "transport-belt",
    "name": "Transport Belt",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "a[transport-belt]-a[transport-belt]"
  },
  {
    "id": "electric-mining-drill",
    "name": "Electric Mining Drill",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "extraction-machine",
    "subgroupOrder": "c",
    "itemOrder": "a[items]-b[electric-mining-drill]"
  },
  {
    "id": "burner-mining-drill",
    "name": "Burner Mining Drill",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "stone-furnace",
        "name": "Stone Furnace",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 3,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "extraction-machine",
    "subgroupOrder": "c",
    "itemOrder": "a[items]-a[burner-mining-drill]"
  },
  {
    "id": "inserter",
    "name": "Inserter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "inserter",
    "subgroupOrder": "c",
    "itemOrder": "b[inserter]"
  },
  {
    "id": "fast-inserter",
    "name": "Fast Inserter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "inserter",
        "name": "Inserter",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "inserter",
    "subgroupOrder": "c",
    "itemOrder": "d[fast-inserter]"
  },
  {
    "id": "long-handed-inserter",
    "name": "Long Handed Inserter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "inserter",
        "name": "Inserter",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "inserter",
    "subgroupOrder": "c",
    "itemOrder": "c[long-handed-inserter]"
  },
  {
    "id": "burner-inserter",
    "name": "Burner Inserter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "inserter",
    "subgroupOrder": "c",
    "itemOrder": "a[burner-inserter]"
  },
  {
    "id": "pipe",
    "name": "Pipe",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "energy-pipe-distribution",
    "subgroupOrder": "d",
    "itemOrder": "a[pipe]-a[pipe]"
  },
  {
    "id": "offshore-pump",
    "name": "Offshore Pump",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "extraction-machine",
    "subgroupOrder": "c",
    "itemOrder": "b[fluids]-a[offshore-pump]"
  },
  {
    "id": "copper-cable",
    "name": "Copper Cable",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "a[basic-intermediates]-c[copper-cable]"
  },
  {
    "id": "small-electric-pole",
    "name": "Small Electric Pole",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "wood",
        "name": "Wood",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "energy-pipe-distribution",
    "subgroupOrder": "d",
    "itemOrder": "a[energy]-a[small-electric-pole]"
  },
  {
    "id": "pistol",
    "name": "Pistol",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "gun",
    "subgroupOrder": "a",
    "itemOrder": "a[basic-clips]-a[pistol]"
  },
  {
    "id": "submachine-gun",
    "name": "Submachine Gun",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "gun",
    "subgroupOrder": "a",
    "itemOrder": "a[basic-clips]-b[submachine-gun]"
  },
  {
    "id": "firearm-magazine",
    "name": "Firearm Magazine",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "a[basic-clips]-a[firearm-magazine]"
  },
  {
    "id": "light-armor",
    "name": "Light Armor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 40,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "armor",
    "subgroupOrder": "d",
    "itemOrder": "a[light-armor]"
  },
  {
    "id": "radar",
    "name": "Radar",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "defensive-structure",
    "subgroupOrder": "h",
    "itemOrder": "d[radar]-a[radar]"
  },
  {
    "id": "small-lamp",
    "name": "Small Lamp",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "circuit-network",
    "subgroupOrder": "h",
    "itemOrder": "a[light]-a[small-lamp]"
  },
  {
    "id": "pipe-to-ground",
    "name": "Pipe To Ground",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "energy-pipe-distribution",
    "subgroupOrder": "d",
    "itemOrder": "a[pipe]-b[pipe-to-ground]"
  },
  {
    "id": "assembling-machine-1",
    "name": "Assembling Machine 1",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 9,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "a[assembling-machine-1]"
  },
  {
    "id": "repair-pack",
    "name": "Repair Pack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "tool",
    "subgroupOrder": "a",
    "itemOrder": "b[repair]-a[repair-pack]"
  },
  {
    "id": "automation-science-pack",
    "name": "Automation Science Pack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "a[automation-science-pack]"
  },
  {
    "id": "logistic-science-pack",
    "name": "Logistic Science Pack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "inserter",
        "name": "Inserter",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "transport-belt",
        "name": "Transport Belt",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 6,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "b[logistic-science-pack]"
  },
  {
    "id": "lab",
    "name": "Lab",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "transport-belt",
        "name": "Transport Belt",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "z[lab]"
  },
  {
    "id": "stone-wall",
    "name": "Stone Wall",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "stone-brick",
        "name": "Stone Brick",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "defensive-structure",
    "subgroupOrder": "h",
    "itemOrder": "a[stone-wall]-a[stone-wall]"
  },
  {
    "id": "assembling-machine-2",
    "name": "Assembling Machine 2",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "assembling-machine-1",
        "name": "Assembling Machine 1",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "b[assembling-machine-2]"
  },
  {
    "id": "splitter",
    "name": "Splitter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "transport-belt",
        "name": "Transport Belt",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "c[splitter]-a[splitter]"
  },
  {
    "id": "underground-belt",
    "name": "Underground Belt",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "transport-belt",
        "name": "Transport Belt",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "b[underground-belt]-a[underground-belt]"
  },
  {
    "id": "loader",
    "name": "Loader",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "inserter",
        "name": "Inserter",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "transport-belt",
        "name": "Transport Belt",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "d[loader]-a[basic-loader]"
  },
  {
    "id": "car",
    "name": "Car",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "engine-unit",
        "name": "Engine Unit",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "transport",
    "subgroupOrder": "f",
    "itemOrder": "b[personal-transport]-a[car]"
  },
  {
    "id": "engine-unit",
    "name": "Engine Unit",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "c[advanced-intermediates]-a[engine-unit]"
  },
  {
    "id": "iron-chest",
    "name": "Iron Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 8,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "storage",
    "subgroupOrder": "a",
    "itemOrder": "a[items]-b[iron-chest]"
  },
  {
    "id": "big-electric-pole",
    "name": "Big Electric Pole",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-stick",
        "name": "Iron Stick",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "energy-pipe-distribution",
    "subgroupOrder": "d",
    "itemOrder": "a[energy]-c[big-electric-pole]"
  },
  {
    "id": "medium-electric-pole",
    "name": "Medium Electric Pole",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-stick",
        "name": "Iron Stick",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "energy-pipe-distribution",
    "subgroupOrder": "d",
    "itemOrder": "a[energy]-b[medium-electric-pole]"
  },
  {
    "id": "shotgun",
    "name": "Shotgun",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "wood",
        "name": "Wood",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "gun",
    "subgroupOrder": "a",
    "itemOrder": "b[shotgun]-a[basic]"
  },
  {
    "id": "shotgun-shell",
    "name": "Shotgun Shell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "b[shotgun]-a[basic]"
  },
  {
    "id": "piercing-rounds-magazine",
    "name": "Piercing Rounds Magazine",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "firearm-magazine",
        "name": "Firearm Magazine",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 6,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "a[basic-clips]-b[piercing-rounds-magazine]"
  },
  {
    "id": "grenade",
    "name": "Grenade",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "coal",
        "name": "Coal",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "capsule",
    "subgroupOrder": "c",
    "itemOrder": "a[grenade]-a[normal]"
  },
  {
    "id": "steel-furnace",
    "name": "Steel Furnace",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 6,
        "type": "item"
      },
      {
        "id": "stone-brick",
        "name": "Stone Brick",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "smelting-machine",
    "subgroupOrder": "d",
    "itemOrder": "b[steel-furnace]"
  },
  {
    "id": "gate",
    "name": "Gate",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "stone-wall",
        "name": "Stone Wall",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "defensive-structure",
    "subgroupOrder": "h",
    "itemOrder": "a[wall]-b[gate]"
  },
  {
    "id": "heavy-armor",
    "name": "Heavy Armor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 50,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "armor",
    "subgroupOrder": "d",
    "itemOrder": "b[heavy-armor]"
  },
  {
    "id": "steel-chest",
    "name": "Steel Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 8,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "storage",
    "subgroupOrder": "a",
    "itemOrder": "a[items]-c[steel-chest]"
  },
  {
    "id": "fast-underground-belt",
    "name": "Fast Underground Belt",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "underground-belt",
        "name": "Underground Belt",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "b[underground-belt]-b[fast-underground-belt]"
  },
  {
    "id": "fast-splitter",
    "name": "Fast Splitter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "splitter",
        "name": "Splitter",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "c[splitter]-b[fast-splitter]"
  },
  {
    "id": "concrete",
    "name": "Concrete",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "stone-brick",
        "name": "Stone Brick",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-ore",
        "name": "Iron Ore",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "b[concrete]-a[plain]"
  },
  {
    "id": "hazard-concrete",
    "name": "Hazard Concrete",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "concrete",
        "name": "Concrete",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.25,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "b[concrete]-b[hazard]"
  },
  {
    "id": "refined-concrete",
    "name": "Refined Concrete",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "concrete",
        "name": "Concrete",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "iron-stick",
        "name": "Iron Stick",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "b[concrete]-c[refined]"
  },
  {
    "id": "refined-hazard-concrete",
    "name": "Refined Hazard Concrete",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.25,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "b[concrete]-d[refined-hazard]"
  },
  {
    "id": "landfill",
    "name": "Landfill",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "stone",
        "name": "Stone",
        "amount": 50,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "c[landfill]-a[dirt]"
  },
  {
    "id": "fast-transport-belt",
    "name": "Fast Transport Belt",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "transport-belt",
        "name": "Transport Belt",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "a[transport-belt]-b[fast-transport-belt]"
  },
  {
    "id": "solar-panel",
    "name": "Solar Panel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "d[solar-panel]-a[solar-panel]"
  },
  {
    "id": "rail",
    "name": "Rail",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "stone",
        "name": "Stone",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-stick",
        "name": "Iron Stick",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "a[rail]-a[rail]"
  },
  {
    "id": "locomotive",
    "name": "Locomotive",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "engine-unit",
        "name": "Engine Unit",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 30,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 4,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "c[rolling-stock]-a[locomotive]"
  },
  {
    "id": "cargo-wagon",
    "name": "Cargo Wagon",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "c[rolling-stock]-b[cargo-wagon]"
  },
  {
    "id": "rail-signal",
    "name": "Rail Signal",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "b[train-automation]-b[rail-signal]"
  },
  {
    "id": "rail-chain-signal",
    "name": "Rail Chain Signal",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "b[train-automation]-c[rail-chain-signal]"
  },
  {
    "id": "train-stop",
    "name": "Train Stop",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 6,
        "type": "item"
      },
      {
        "id": "iron-stick",
        "name": "Iron Stick",
        "amount": 6,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 3,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "b[train-automation]-a[train-stop]"
  },
  {
    "id": "copper-plate",
    "name": "Copper Plate",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-ore",
        "name": "Copper Ore",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 3.2,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "a[smelting]-b[copper-plate]"
  },
  {
    "id": "iron-plate",
    "name": "Iron Plate",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-ore",
        "name": "Iron Ore",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 3.2,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "a[smelting]-a[iron-plate]"
  },
  {
    "id": "stone-brick",
    "name": "Stone Brick",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "stone",
        "name": "Stone",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 3.2,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "a[stone-brick]"
  },
  {
    "id": "steel-plate",
    "name": "Steel Plate",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 16,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "a[smelting]-c[steel-plate]"
  },
  {
    "id": "arithmetic-combinator",
    "name": "Arithmetic Combinator",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "circuit-network",
    "subgroupOrder": "h",
    "itemOrder": "c[combinators]-a[arithmetic-combinator]"
  },
  {
    "id": "decider-combinator",
    "name": "Decider Combinator",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "circuit-network",
    "subgroupOrder": "h",
    "itemOrder": "c[combinators]-b[decider-combinator]"
  },
  {
    "id": "constant-combinator",
    "name": "Constant Combinator",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "circuit-network",
    "subgroupOrder": "h",
    "itemOrder": "c[combinators]-d[constant-combinator]"
  },
  {
    "id": "selector-combinator",
    "name": "Selector Combinator",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "decider-combinator",
        "name": "Decider Combinator",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "circuit-network",
    "subgroupOrder": "h",
    "itemOrder": "c[combinators]-c[selector-combinator]"
  },
  {
    "id": "power-switch",
    "name": "Power Switch",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "circuit-network",
    "subgroupOrder": "h",
    "itemOrder": "d[other]-a[power-switch]"
  },
  {
    "id": "programmable-speaker",
    "name": "Programmable Speaker",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "iron-stick",
        "name": "Iron Stick",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "circuit-network",
    "subgroupOrder": "h",
    "itemOrder": "d[other]-b[programmable-speaker]"
  },
  {
    "id": "poison-capsule",
    "name": "Poison Capsule",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "coal",
        "name": "Coal",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "capsule",
    "subgroupOrder": "c",
    "itemOrder": "b[poison-capsule]"
  },
  {
    "id": "slowdown-capsule",
    "name": "Slowdown Capsule",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "coal",
        "name": "Coal",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "capsule",
    "subgroupOrder": "c",
    "itemOrder": "c[slowdown-capsule]"
  },
  {
    "id": "cluster-grenade",
    "name": "Cluster Grenade",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "grenade",
        "name": "Grenade",
        "amount": 7,
        "type": "item"
      },
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "capsule",
    "subgroupOrder": "c",
    "itemOrder": "a[grenade]-b[cluster]"
  },
  {
    "id": "defender-capsule",
    "name": "Defender Capsule",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "piercing-rounds-magazine",
        "name": "Piercing Rounds Magazine",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 3,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "capsule",
    "subgroupOrder": "c",
    "itemOrder": "d[defender]-b[capsule]"
  },
  {
    "id": "distractor-capsule",
    "name": "Distractor Capsule",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "defender-capsule",
        "name": "Defender Capsule",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 3,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "capsule",
    "subgroupOrder": "c",
    "itemOrder": "e[distractor]-b[capsule]"
  },
  {
    "id": "destroyer-capsule",
    "name": "Destroyer Capsule",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "distractor-capsule",
        "name": "Distractor Capsule",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "capsule",
    "subgroupOrder": "c",
    "itemOrder": "f[destroyer]-b[capsule]"
  },
  {
    "id": "cliff-explosives",
    "name": "Cliff Explosives",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "calcite",
        "name": "Calcite",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "grenade",
        "name": "Grenade",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "d[cliff-explosives]"
  },
  {
    "id": "uranium-rounds-magazine",
    "name": "Uranium Rounds Magazine",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "piercing-rounds-magazine",
        "name": "Piercing Rounds Magazine",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "uranium-238",
        "name": "Uranium 238",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "a[basic-clips]-c[uranium-rounds-magazine]"
  },
  {
    "id": "rocket",
    "name": "Rocket",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 4,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[rocket-launcher]-a[basic]"
  },
  {
    "id": "explosive-rocket",
    "name": "Explosive Rocket",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "rocket",
        "name": "Rocket",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[rocket-launcher]-b[explosive]"
  },
  {
    "id": "atomic-bomb",
    "name": "Atomic Bomb",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "uranium-235",
        "name": "Uranium 235",
        "amount": 100,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 50,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[rocket-launcher]-d[atomic-bomb]"
  },
  {
    "id": "piercing-shotgun-shell",
    "name": "Piercing Shotgun Shell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "shotgun-shell",
        "name": "Shotgun Shell",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "b[shotgun]-b[piercing]"
  },
  {
    "id": "cannon-shell",
    "name": "Cannon Shell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "plastic-bar",
        "name": "Plastic Bar",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[cannon-shell]-a[basic]"
  },
  {
    "id": "explosive-cannon-shell",
    "name": "Explosive Cannon Shell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "plastic-bar",
        "name": "Plastic Bar",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[cannon-shell]-c[explosive]"
  },
  {
    "id": "uranium-cannon-shell",
    "name": "Uranium Cannon Shell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "cannon-shell",
        "name": "Cannon Shell",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "uranium-238",
        "name": "Uranium 238",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 12,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[cannon-shell]-c[uranium]"
  },
  {
    "id": "explosive-uranium-cannon-shell",
    "name": "Explosive Uranium Cannon Shell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "explosive-cannon-shell",
        "name": "Explosive Cannon Shell",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "uranium-238",
        "name": "Uranium 238",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 12,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[explosive-cannon-shell]-c[uranium]"
  },
  {
    "id": "artillery-shell",
    "name": "Artillery Shell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "radar",
        "name": "Radar",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "calcite",
        "name": "Calcite",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 8,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[explosive-cannon-shell]-d[artillery]"
  },
  {
    "id": "flamethrower-ammo",
    "name": "Flamethrower Ammo",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "crude-oil",
        "name": "Crude Oil",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "combat",
    "craftingTime": 6,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "e[flamethrower]"
  },
  {
    "id": "express-transport-belt",
    "name": "Express Transport Belt",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "fast-transport-belt",
        "name": "Fast Transport Belt",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 20,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "a[transport-belt]-c[express-transport-belt]"
  },
  {
    "id": "assembling-machine-3",
    "name": "Assembling Machine 3",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "assembling-machine-2",
        "name": "Assembling Machine 2",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "speed-module",
        "name": "Speed Module",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "c[assembling-machine-3]"
  },
  {
    "id": "tank",
    "name": "Tank",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "engine-unit",
        "name": "Engine Unit",
        "amount": 32,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "transport",
    "subgroupOrder": "f",
    "itemOrder": "b[personal-transport]-b[tank]"
  },
  {
    "id": "spidertron",
    "name": "Spidertron",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "exoskeleton-equipment",
        "name": "Exoskeleton Equipment",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "fission-reactor-equipment",
        "name": "Fission Reactor Equipment",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "rocket-turret",
        "name": "Rocket Turret",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "radar",
        "name": "Radar",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "raw-fish",
        "name": "Raw Fish",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "transport",
    "subgroupOrder": "f",
    "itemOrder": "b[personal-transport]-c[spidertron]-a[spider]"
  },
  {
    "id": "fluid-wagon",
    "name": "Fluid Wagon",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 16,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "storage-tank",
        "name": "Storage Tank",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 1.5,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "c[rolling-stock]-c[fluid-wagon]"
  },
  {
    "id": "artillery-wagon",
    "name": "Artillery Wagon",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "engine-unit",
        "name": "Engine Unit",
        "amount": 60,
        "type": "item"
      },
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 60,
        "type": "item"
      },
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 60,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 4,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "c[rolling-stock]-d[artillery-wagon]"
  },
  {
    "id": "modular-armor",
    "name": "Modular Armor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 30,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 50,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "armor",
    "subgroupOrder": "d",
    "itemOrder": "c[modular-armor]"
  },
  {
    "id": "power-armor",
    "name": "Power Armor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 40,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "armor",
    "subgroupOrder": "d",
    "itemOrder": "d[power-armor]"
  },
  {
    "id": "power-armor-mk2",
    "name": "Power Armor Mk2",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "efficiency-module",
        "name": "Efficiency Module",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "speed-module",
        "name": "Speed Module",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 60,
        "type": "item"
      },
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 30,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 25,
    "isFluid": false,
    "subgroup": "armor",
    "subgroupOrder": "d",
    "itemOrder": "e[power-armor-mk2]"
  },
  {
    "id": "flamethrower",
    "name": "Flamethrower",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "gun",
    "subgroupOrder": "a",
    "itemOrder": "e[flamethrower]"
  },
  {
    "id": "land-mine",
    "name": "Land Mine",
    "resultAmount": 4,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "defensive-structure",
    "subgroupOrder": "h",
    "itemOrder": "f[land-mine]"
  },
  {
    "id": "rocket-launcher",
    "name": "Rocket Launcher",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "gun",
    "subgroupOrder": "a",
    "itemOrder": "d[rocket-launcher]"
  },
  {
    "id": "combat-shotgun",
    "name": "Combat Shotgun",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "wood",
        "name": "Wood",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "gun",
    "subgroupOrder": "a",
    "itemOrder": "b[shotgun]-a[combat]"
  },
  {
    "id": "chemical-science-pack",
    "name": "Chemical Science Pack",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "engine-unit",
        "name": "Engine Unit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "sulfur",
        "name": "Sulfur",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 24,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "d[chemical-science-pack]"
  },
  {
    "id": "military-science-pack",
    "name": "Military Science Pack",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "piercing-rounds-magazine",
        "name": "Piercing Rounds Magazine",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "grenade",
        "name": "Grenade",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "stone-wall",
        "name": "Stone Wall",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "c[military-science-pack]"
  },
  {
    "id": "production-science-pack",
    "name": "Production Science Pack",
    "resultAmount": 3,
    "ingredients": [
      {
        "id": "electric-furnace",
        "name": "Electric Furnace",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "productivity-module",
        "name": "Productivity Module",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "rail",
        "name": "Rail",
        "amount": 30,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 21,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "e[production-science-pack]"
  },
  {
    "id": "utility-science-pack",
    "name": "Utility Science Pack",
    "resultAmount": 3,
    "ingredients": [
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "flying-robot-frame",
        "name": "Flying Robot Frame",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 21,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "f[utility-science-pack]"
  },
  {
    "id": "express-underground-belt",
    "name": "Express Underground Belt",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 80,
        "type": "item"
      },
      {
        "id": "fast-underground-belt",
        "name": "Fast Underground Belt",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 40,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "b[underground-belt]-c[express-underground-belt]"
  },
  {
    "id": "fast-loader",
    "name": "Fast Loader",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "fast-transport-belt",
        "name": "Fast Transport Belt",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "loader",
        "name": "Loader",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "d[loader]-b[fast-loader]"
  },
  {
    "id": "express-loader",
    "name": "Express Loader",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "express-transport-belt",
        "name": "Express Transport Belt",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "fast-loader",
        "name": "Fast Loader",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "d[loader]-c[express-loader]"
  },
  {
    "id": "express-splitter",
    "name": "Express Splitter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "fast-splitter",
        "name": "Fast Splitter",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 80,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "c[splitter]-c[express-splitter]"
  },
  {
    "id": "advanced-circuit",
    "name": "Advanced Circuit",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "plastic-bar",
        "name": "Plastic Bar",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 6,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "b[circuits]-b[advanced-circuit]"
  },
  {
    "id": "processing-unit",
    "name": "Processing Unit",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "sulfuric-acid",
        "name": "Sulfuric Acid",
        "amount": 5,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "b[circuits]-c[processing-unit]"
  },
  {
    "id": "logistic-robot",
    "name": "Logistic Robot",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "flying-robot-frame",
        "name": "Flying Robot Frame",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "logistic-network",
    "subgroupOrder": "g",
    "itemOrder": "a[robot]-a[logistic-robot]"
  },
  {
    "id": "construction-robot",
    "name": "Construction Robot",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "flying-robot-frame",
        "name": "Flying Robot Frame",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "logistic-network",
    "subgroupOrder": "g",
    "itemOrder": "a[robot]-b[construction-robot]"
  },
  {
    "id": "passive-provider-chest",
    "name": "Passive Provider Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-chest",
        "name": "Steel Chest",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "logistic-network",
    "subgroupOrder": "g",
    "itemOrder": "b[storage]-c[passive-provider-chest]"
  },
  {
    "id": "active-provider-chest",
    "name": "Active Provider Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-chest",
        "name": "Steel Chest",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "logistic-network",
    "subgroupOrder": "g",
    "itemOrder": "b[storage]-c[active-provider-chest]"
  },
  {
    "id": "storage-chest",
    "name": "Storage Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-chest",
        "name": "Steel Chest",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "logistic-network",
    "subgroupOrder": "g",
    "itemOrder": "b[storage]-c[storage-chest]"
  },
  {
    "id": "buffer-chest",
    "name": "Buffer Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-chest",
        "name": "Steel Chest",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "logistic-network",
    "subgroupOrder": "g",
    "itemOrder": "b[storage]-d[buffer-chest]"
  },
  {
    "id": "requester-chest",
    "name": "Requester Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-chest",
        "name": "Steel Chest",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "logistic-network",
    "subgroupOrder": "g",
    "itemOrder": "b[storage]-e[requester-chest]"
  },
  {
    "id": "rocket-silo",
    "name": "Rocket Silo",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1000,
        "type": "item"
      },
      {
        "id": "concrete",
        "name": "Concrete",
        "amount": 1000,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 200,
        "type": "item"
      },
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 200,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "space-interactors",
    "subgroupOrder": "a",
    "itemOrder": "a[rocket-silo]"
  },
  {
    "id": "cargo-landing-pad",
    "name": "Cargo Landing Pad",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "concrete",
        "name": "Concrete",
        "amount": 200,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 25,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "space-interactors",
    "subgroupOrder": "a",
    "itemOrder": "c[cargo-landing-pad]"
  },
  {
    "id": "roboport",
    "name": "Roboport",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 45,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 45,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 45,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "logistic-network",
    "subgroupOrder": "g",
    "itemOrder": "c[signal]-a[roboport]"
  },
  {
    "id": "substation",
    "name": "Substation",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 6,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "energy-pipe-distribution",
    "subgroupOrder": "d",
    "itemOrder": "a[energy]-d[substation]"
  },
  {
    "id": "accumulator",
    "name": "Accumulator",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "battery",
        "name": "Battery",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "e[accumulator]-a[accumulator]"
  },
  {
    "id": "electric-furnace",
    "name": "Electric Furnace",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "stone-brick",
        "name": "Stone Brick",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "smelting-machine",
    "subgroupOrder": "d",
    "itemOrder": "c[electric-furnace]"
  },
  {
    "id": "beacon",
    "name": "Beacon",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "a[beacon]"
  },
  {
    "id": "pumpjack",
    "name": "Pumpjack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "extraction-machine",
    "subgroupOrder": "c",
    "itemOrder": "b[fluids]-b[pumpjack]"
  },
  {
    "id": "oil-refinery",
    "name": "Oil Refinery",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "stone-brick",
        "name": "Stone Brick",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "d[refinery]"
  },
  {
    "id": "electric-engine-unit",
    "name": "Electric Engine Unit",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "engine-unit",
        "name": "Engine Unit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 15,
        "type": "fluid"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "c[advanced-intermediates]-b[electric-engine-unit]"
  },
  {
    "id": "flying-robot-frame",
    "name": "Flying Robot Frame",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "battery",
        "name": "Battery",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "c[advanced-intermediates]-c[flying-robot-frame]"
  },
  {
    "id": "explosives",
    "name": "Explosives",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "sulfur",
        "name": "Sulfur",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "coal",
        "name": "Coal",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 4,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "b[chemistry]-e[explosives]"
  },
  {
    "id": "battery",
    "name": "Battery",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "sulfuric-acid",
        "name": "Sulfuric Acid",
        "amount": 20,
        "type": "fluid"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 4,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "b[chemistry]-d[battery]"
  },
  {
    "id": "storage-tank",
    "name": "Storage Tank",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "storage",
    "subgroupOrder": "a",
    "itemOrder": "b[fluid]-a[storage-tank]"
  },
  {
    "id": "pump",
    "name": "Pump",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "engine-unit",
        "name": "Engine Unit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "energy-pipe-distribution",
    "subgroupOrder": "d",
    "itemOrder": "b[pipe]-c[pump]"
  },
  {
    "id": "chemical-plant",
    "name": "Chemical Plant",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "e[chemical-plant]"
  },
  {
    "id": "low-density-structure",
    "name": "Low Density Structure",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "plastic-bar",
        "name": "Plastic Bar",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "d[rocket-parts]-a[low-density-structure]"
  },
  {
    "id": "rocket-fuel",
    "name": "Rocket Fuel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "solid-fuel",
        "name": "Solid Fuel",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "light-oil",
        "name": "Light Oil",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "intermediate-product",
    "subgroupOrder": "g",
    "itemOrder": "d[rocket-parts]-b[rocket-fuel]"
  },
  {
    "id": "rocket-part",
    "name": "Rocket Part",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "rocket-fuel",
        "name": "Rocket Fuel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "space-interactors",
    "subgroupOrder": "a",
    "itemOrder": "b[rocket-part]"
  },
  {
    "id": "nuclear-reactor",
    "name": "Nuclear Reactor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "concrete",
        "name": "Concrete",
        "amount": 500,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 500,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 500,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 500,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 8,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "f[nuclear-energy]-a[reactor]"
  },
  {
    "id": "centrifuge",
    "name": "Centrifuge",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "concrete",
        "name": "Concrete",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 100,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 4,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "f[centrifuge]"
  },
  {
    "id": "uranium-235",
    "name": "Uranium 235",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "uranium-ore",
        "name": "Uranium Ore",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 12,
    "isFluid": false,
    "subgroup": "uranium-processing",
    "subgroupOrder": "i",
    "itemOrder": "a[uranium-processing]-b[uranium-235]"
  },
  {
    "id": "nuclear-fuel",
    "name": "Nuclear Fuel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "uranium-235",
        "name": "Uranium 235",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "rocket-fuel",
        "name": "Rocket Fuel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 90,
    "isFluid": false,
    "subgroup": "uranium-processing",
    "subgroupOrder": "i",
    "itemOrder": "r[uranium-processing]-e[nuclear-fuel]"
  },
  {
    "id": "uranium-238",
    "name": "Uranium 238",
    "resultAmount": 3,
    "ingredients": [
      {
        "id": "depleted-uranium-fuel-cell",
        "name": "Depleted Uranium Fuel Cell",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 60,
    "isFluid": false,
    "subgroup": "uranium-processing",
    "subgroupOrder": "i",
    "itemOrder": "a[uranium-processing]-c[uranium-238]"
  },
  {
    "id": "uranium-fuel-cell",
    "name": "Uranium Fuel Cell",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "uranium-235",
        "name": "Uranium 235",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "uranium-238",
        "name": "Uranium 238",
        "amount": 19,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "uranium-processing",
    "subgroupOrder": "i",
    "itemOrder": "b[uranium-products]-a[uranium-fuel-cell]"
  },
  {
    "id": "heat-exchanger",
    "name": "Heat Exchanger",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "f[nuclear-energy]-c[heat-exchanger]"
  },
  {
    "id": "heat-pipe",
    "name": "Heat Pipe",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "f[nuclear-energy]-b[heat-pipe]"
  },
  {
    "id": "steam-turbine",
    "name": "Steam Turbine",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "f[nuclear-energy]-d[steam-turbine]"
  },
  {
    "id": "rail-support",
    "name": "Rail Support",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "a[rail]-c[rail-support]"
  },
  {
    "id": "rail-ramp",
    "name": "Rail Ramp",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "rail",
        "name": "Rail",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "train-transport",
    "subgroupOrder": "e",
    "itemOrder": "a[rail]-b[rail-ramp]"
  },
  {
    "id": "quality-module",
    "name": "Quality Module",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "d[quality]-a[quality-module-1]"
  },
  {
    "id": "quality-module-2",
    "name": "Quality Module 2",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "quality-module",
        "name": "Quality Module",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "d[quality]-b[quality-module-2]"
  },
  {
    "id": "quality-module-3",
    "name": "Quality Module 3",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "quality-module-2",
        "name": "Quality Module 2",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 60,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "d[quality]-c[quality-module-3]"
  },
  {
    "id": "recycler",
    "name": "Recycler",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 6,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "concrete",
        "name": "Concrete",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 3,
    "isFluid": false,
    "subgroup": "smelting-machine",
    "subgroupOrder": "d",
    "itemOrder": "d[recycler]"
  },
  {
    "id": "yumako-seed",
    "name": "Yumako Seed",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "yumako",
        "name": "Yumako",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "agriculture-processes",
    "subgroupOrder": "m",
    "itemOrder": "a[seeds]-a[yumako-seed]"
  },
  {
    "id": "jellynut-seed",
    "name": "Jellynut Seed",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "jellynut",
        "name": "Jellynut",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "agriculture-processes",
    "subgroupOrder": "m",
    "itemOrder": "a[seeds]-b[jellynut-seed]"
  },
  {
    "id": "copper-bacteria",
    "name": "Copper Bacteria",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "yumako-mash",
        "name": "Yumako Mash",
        "amount": 3,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "agriculture-processes",
    "subgroupOrder": "m",
    "itemOrder": "b[agriculture]-d[bacteria]-c[copper-bacteria]"
  },
  {
    "id": "iron-bacteria",
    "name": "Iron Bacteria",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "jelly",
        "name": "Jelly",
        "amount": 6,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "agriculture-processes",
    "subgroupOrder": "m",
    "itemOrder": "b[agriculture]-d[bacteria]-a[iron-bacteria]"
  },
  {
    "id": "artificial-yumako-soil",
    "name": "Artificial Yumako Soil",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "yumako-seed",
        "name": "Yumako Seed",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "nutrients",
        "name": "Nutrients",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "landfill",
        "name": "Landfill",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "c[landfill]-b[artificial-yumako-soil]"
  },
  {
    "id": "overgrowth-yumako-soil",
    "name": "Overgrowth Yumako Soil",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "artificial-yumako-soil",
        "name": "Artificial Yumako Soil",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "yumako-seed",
        "name": "Yumako Seed",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "biter-egg",
        "name": "Biter Egg",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "spoilage",
        "name": "Spoilage",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "c[landfill]-c[overgrowth-yumako-soil]"
  },
  {
    "id": "artificial-jellynut-soil",
    "name": "Artificial Jellynut Soil",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "jellynut-seed",
        "name": "Jellynut Seed",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "nutrients",
        "name": "Nutrients",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "landfill",
        "name": "Landfill",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "c[landfill]-d[artificial-jellynut-soil]"
  },
  {
    "id": "overgrowth-jellynut-soil",
    "name": "Overgrowth Jellynut Soil",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "artificial-jellynut-soil",
        "name": "Artificial Jellynut Soil",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "jellynut-seed",
        "name": "Jellynut Seed",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "biter-egg",
        "name": "Biter Egg",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "spoilage",
        "name": "Spoilage",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "c[landfill]-e[overgrowth-jellynut-soil]"
  },
  {
    "id": "nutrients",
    "name": "Nutrients",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "spoilage",
        "name": "Spoilage",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "agriculture-processes",
    "subgroupOrder": "m",
    "itemOrder": "c[nutrients]-b[nutrients]"
  },
  {
    "id": "pentapod-egg",
    "name": "Pentapod Egg",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "pentapod-egg",
        "name": "Pentapod Egg",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "nutrients",
        "name": "Nutrients",
        "amount": 30,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 60,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "agriculture-products",
    "subgroupOrder": "n",
    "itemOrder": "c[eggs]-b[pentapod-egg]"
  },
  {
    "id": "bioflux",
    "name": "Bioflux",
    "resultAmount": 4,
    "ingredients": [
      {
        "id": "yumako-mash",
        "name": "Yumako Mash",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "jelly",
        "name": "Jelly",
        "amount": 12,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 6,
    "isFluid": false,
    "subgroup": "agriculture-products",
    "subgroupOrder": "n",
    "itemOrder": "a[organic-processing]-b[bioflux]"
  },
  {
    "id": "carbon-fiber",
    "name": "Carbon Fiber",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "yumako-mash",
        "name": "Yumako Mash",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "carbon",
        "name": "Carbon",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "agriculture-products",
    "subgroupOrder": "n",
    "itemOrder": "a[organic-products]-e[carbon-fiber]"
  },
  {
    "id": "toolbelt-equipment",
    "name": "Toolbelt Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "carbon-fiber",
        "name": "Carbon Fiber",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "utility-equipment",
    "subgroupOrder": "f",
    "itemOrder": "g[toolbelt]-a[night-vision-equipment]"
  },
  {
    "id": "battery-mk3-equipment",
    "name": "Battery Mk3 Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "battery-mk2-equipment",
        "name": "Battery Mk2 Equipment",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "supercapacitor",
        "name": "Supercapacitor",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "equipment",
    "subgroupOrder": "e",
    "itemOrder": "b[battery]-c[battery-equipment-mk3]"
  },
  {
    "id": "space-platform-foundation",
    "name": "Space Platform Foundation",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "space-platform",
    "subgroupOrder": "a",
    "itemOrder": "a[space-platform-foundation]"
  },
  {
    "id": "stack-inserter",
    "name": "Stack Inserter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "bulk-inserter",
        "name": "Bulk Inserter",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "carbon-fiber",
        "name": "Carbon Fiber",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "jelly",
        "name": "Jelly",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "inserter",
    "subgroupOrder": "c",
    "itemOrder": "h[stack-inserter]"
  },
  {
    "id": "rocket-turret",
    "name": "Rocket Turret",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "rocket-launcher",
        "name": "Rocket Launcher",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "carbon-fiber",
        "name": "Carbon Fiber",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "iron-gear-wheel",
        "name": "Iron Gear Wheel",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "turret",
    "subgroupOrder": "i",
    "itemOrder": "b[turret]-e[rocket-turret]-a[turret]"
  },
  {
    "id": "infinity-chest",
    "name": "Infinity Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-chest",
        "name": "Steel Chest",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "c[item]-o[infinity-chest]"
  },
  {
    "id": "infinity-pipe",
    "name": "Infinity Pipe",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "pipe",
        "name": "Pipe",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "d[item]-o[infinity-pipe]"
  },
  {
    "id": "heat-interface",
    "name": "Heat Interface",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "heat-pipe",
        "name": "Heat Pipe",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "b[heat-interface]"
  },
  {
    "id": "space-platform-starter-pack",
    "name": "Space Platform Starter Pack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "space-platform-foundation",
        "name": "Space Platform Foundation",
        "amount": 60,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 60,
    "isFluid": false,
    "subgroup": "",
    "subgroupOrder": "",
    "itemOrder": ""
  },
  {
    "id": "cargo-bay",
    "name": "Cargo Bay",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "space-platform",
    "subgroupOrder": "a",
    "itemOrder": "c[cargo-bay]"
  },
  {
    "id": "asteroid-collector",
    "name": "Asteroid Collector",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "space-platform",
    "subgroupOrder": "a",
    "itemOrder": "d[asteroid-collector]"
  },
  {
    "id": "crusher",
    "name": "Crusher",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "low-density-structure",
        "name": "Low Density Structure",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "space-platform",
    "subgroupOrder": "a",
    "itemOrder": "e[crusher]"
  },
  {
    "id": "thruster",
    "name": "Thruster",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 5,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "space-platform",
    "subgroupOrder": "a",
    "itemOrder": "f[thruster]"
  },
  {
    "id": "space-science-pack",
    "name": "Space Science Pack",
    "resultAmount": 5,
    "ingredients": [
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "carbon",
        "name": "Carbon",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "ice",
        "name": "Ice",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 15,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "g[space-science-pack]"
  },
  {
    "id": "metallurgic-science-pack",
    "name": "Metallurgic Science Pack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-carbide",
        "name": "Tungsten Carbide",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "molten-copper",
        "name": "Molten Copper",
        "amount": 200,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "h"
  },
  {
    "id": "agricultural-science-pack",
    "name": "Agricultural Science Pack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "bioflux",
        "name": "Bioflux",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "pentapod-egg",
        "name": "Pentapod Egg",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 4,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "i"
  },
  {
    "id": "electromagnetic-science-pack",
    "name": "Electromagnetic Science Pack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "supercapacitor",
        "name": "Supercapacitor",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "accumulator",
        "name": "Accumulator",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electrolyte",
        "name": "Electrolyte",
        "amount": 25,
        "type": "fluid"
      },
      {
        "id": "holmium-solution",
        "name": "Holmium Solution",
        "amount": 25,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "j"
  },
  {
    "id": "cryogenic-science-pack",
    "name": "Cryogenic Science Pack",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "ice",
        "name": "Ice",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "lithium-plate",
        "name": "Lithium Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "fluoroketone-cold",
        "name": "Fluoroketone Cold",
        "amount": 6,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "k"
  },
  {
    "id": "iron-ore",
    "name": "Iron Ore",
    "resultAmount": 20,
    "ingredients": [
      {
        "id": "metallic-asteroid-chunk",
        "name": "Metallic Asteroid Chunk",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "raw-resource",
    "subgroupOrder": "b",
    "itemOrder": "e[iron-ore]"
  },
  {
    "id": "carbon",
    "name": "Carbon",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "carbonic-asteroid-chunk",
        "name": "Carbonic Asteroid Chunk",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "raw-material",
    "subgroupOrder": "c",
    "itemOrder": "b[chemistry]-f[carbon]"
  },
  {
    "id": "ice",
    "name": "Ice",
    "resultAmount": 5,
    "ingredients": [
      {
        "id": "oxide-asteroid-chunk",
        "name": "Oxide Asteroid Chunk",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "raw-resource",
    "subgroupOrder": "b",
    "itemOrder": "j[ice]"
  },
  {
    "id": "metallic-asteroid-chunk",
    "name": "Metallic Asteroid Chunk",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "metallic-asteroid-chunk",
        "name": "Metallic Asteroid Chunk",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "space-material",
    "subgroupOrder": "g",
    "itemOrder": "a[metallic]-e[chunk]"
  },
  {
    "id": "carbonic-asteroid-chunk",
    "name": "Carbonic Asteroid Chunk",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "carbonic-asteroid-chunk",
        "name": "Carbonic Asteroid Chunk",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "space-material",
    "subgroupOrder": "g",
    "itemOrder": "b[carbonic]-e[chunk]"
  },
  {
    "id": "oxide-asteroid-chunk",
    "name": "Oxide Asteroid Chunk",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "oxide-asteroid-chunk",
        "name": "Oxide Asteroid Chunk",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "space-material",
    "subgroupOrder": "g",
    "itemOrder": "c[oxide]-e[chunk]"
  },
  {
    "id": "thruster-fuel",
    "name": "Thruster Fuel",
    "resultAmount": 75,
    "ingredients": [
      {
        "id": "carbon",
        "name": "Carbon",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 2,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "b[new-fluid]-a[space]-a[thruster-fuel]"
  },
  {
    "id": "thruster-oxidizer",
    "name": "Thruster Oxidizer",
    "resultAmount": 75,
    "ingredients": [
      {
        "id": "iron-ore",
        "name": "Iron Ore",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 2,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "b[new-fluid]-a[space]-b[thruster-oxidizer]"
  },
  {
    "id": "water",
    "name": "Water",
    "resultAmount": 20,
    "ingredients": [
      {
        "id": "ice",
        "name": "Ice",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "fluids",
    "craftingTime": 1,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "a[fluid]-a[water]-a[water]"
  },
  {
    "id": "steam",
    "name": "Steam",
    "resultAmount": 10000,
    "ingredients": [
      {
        "id": "calcite",
        "name": "Calcite",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "sulfuric-acid",
        "name": "Sulfuric Acid",
        "amount": 1000,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 5,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "a[fluid]-a[water]-b[steam]"
  },
  {
    "id": "tungsten-carbide",
    "name": "Tungsten Carbide",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-ore",
        "name": "Tungsten Ore",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "sulfuric-acid",
        "name": "Sulfuric Acid",
        "amount": 10,
        "type": "fluid"
      },
      {
        "id": "carbon",
        "name": "Carbon",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "vulcanus-processes",
    "subgroupOrder": "k",
    "itemOrder": "c[tungsten]-b[tungsten-carbide]"
  },
  {
    "id": "foundry",
    "name": "Foundry",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-carbide",
        "name": "Tungsten Carbide",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 30,
        "type": "item"
      },
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 20,
        "type": "fluid"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "smelting-machine",
    "subgroupOrder": "d",
    "itemOrder": "d[foundry]"
  },
  {
    "id": "molten-iron",
    "name": "Molten Iron",
    "resultAmount": 250,
    "ingredients": [
      {
        "id": "lava",
        "name": "Lava",
        "amount": 500,
        "type": "fluid"
      },
      {
        "id": "calcite",
        "name": "Calcite",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "fluids",
    "craftingTime": 16,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "b[new-fluid]-b[vulcanus]-a[molten-iron]"
  },
  {
    "id": "molten-copper",
    "name": "Molten Copper",
    "resultAmount": 250,
    "ingredients": [
      {
        "id": "lava",
        "name": "Lava",
        "amount": 500,
        "type": "fluid"
      },
      {
        "id": "calcite",
        "name": "Calcite",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "fluids",
    "craftingTime": 16,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "b[new-fluid]-b[vulcanus]-b[molten-copper]"
  },
  {
    "id": "tungsten-plate",
    "name": "Tungsten Plate",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-ore",
        "name": "Tungsten Ore",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "molten-iron",
        "name": "Molten Iron",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "vulcanus-processes",
    "subgroupOrder": "k",
    "itemOrder": "c[tungsten]-c[tungsten-plate]"
  },
  {
    "id": "turbo-transport-belt",
    "name": "Turbo Transport Belt",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "express-transport-belt",
        "name": "Express Transport Belt",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 20,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 0.5,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "a[transport-belt]-d[turbo-transport-belt]"
  },
  {
    "id": "turbo-underground-belt",
    "name": "Turbo Underground Belt",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "express-underground-belt",
        "name": "Express Underground Belt",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 40,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "b[underground-belt]-d[turbo-underground-belt]"
  },
  {
    "id": "turbo-splitter",
    "name": "Turbo Splitter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "express-splitter",
        "name": "Express Splitter",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 80,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "c[splitter]-d[turbo-splitter]"
  },
  {
    "id": "turbo-loader",
    "name": "Turbo Loader",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "turbo-transport-belt",
        "name": "Turbo Transport Belt",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "express-loader",
        "name": "Express Loader",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "belt",
    "subgroupOrder": "b",
    "itemOrder": "d[loader]-d[turbo-loader]"
  },
  {
    "id": "big-mining-drill",
    "name": "Big Mining Drill",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electric-mining-drill",
        "name": "Electric Mining Drill",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "molten-iron",
        "name": "Molten Iron",
        "amount": 200,
        "type": "fluid"
      },
      {
        "id": "tungsten-carbide",
        "name": "Tungsten Carbide",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "electric-engine-unit",
        "name": "Electric Engine Unit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "advanced-circuit",
        "name": "Advanced Circuit",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "extraction-machine",
    "subgroupOrder": "c",
    "itemOrder": "a[items]-c[big-mining-drill]"
  },
  {
    "id": "mech-armor",
    "name": "Mech Armor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "power-armor-mk2",
        "name": "Power Armor Mk2",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "holmium-plate",
        "name": "Holmium Plate",
        "amount": 200,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "supercapacitor",
        "name": "Supercapacitor",
        "amount": 50,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 60,
    "isFluid": false,
    "subgroup": "armor",
    "subgroupOrder": "d",
    "itemOrder": "f[mech-armor]"
  },
  {
    "id": "railgun",
    "name": "Railgun",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "quantum-processor",
        "name": "Quantum Processor",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "fluoroketone-cold",
        "name": "Fluoroketone Cold",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "gun",
    "subgroupOrder": "a",
    "itemOrder": "a[basic-clips]-h[railgun]"
  },
  {
    "id": "railgun-turret",
    "name": "Railgun Turret",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "quantum-processor",
        "name": "Quantum Processor",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 30,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "carbon-fiber",
        "name": "Carbon Fiber",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "fluoroketone-cold",
        "name": "Fluoroketone Cold",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "turret",
    "subgroupOrder": "i",
    "itemOrder": "b[turret]-g[railgun-turret]-a[turret]"
  },
  {
    "id": "railgun-ammo",
    "name": "Railgun Ammo",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "explosives",
        "name": "Explosives",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 25,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "e[railgun-ammo]-a[basic]"
  },
  {
    "id": "agricultural-tower",
    "name": "Agricultural Tower",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 3,
        "type": "item"
      },
      {
        "id": "spoilage",
        "name": "Spoilage",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "landfill",
        "name": "Landfill",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "agriculture",
    "subgroupOrder": "da",
    "itemOrder": "a[agricultural-tower]"
  },
  {
    "id": "biochamber",
    "name": "Biochamber",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "nutrients",
        "name": "Nutrients",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "pentapod-egg",
        "name": "Pentapod Egg",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "iron-plate",
        "name": "Iron Plate",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "landfill",
        "name": "Landfill",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "agriculture",
    "subgroupOrder": "da",
    "itemOrder": "b[biochamber]"
  },
  {
    "id": "coal",
    "name": "Coal",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "carbon",
        "name": "Carbon",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "sulfur",
        "name": "Sulfur",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "raw-resource",
    "subgroupOrder": "b",
    "itemOrder": "b[coal]"
  },
  {
    "id": "capture-robot-rocket",
    "name": "Capture Robot Rocket",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "flying-robot-frame",
        "name": "Flying Robot Frame",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "bioflux",
        "name": "Bioflux",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "d[rocket-launcher]-d[capture]"
  },
  {
    "id": "biolab",
    "name": "Biolab",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "lab",
        "name": "Lab",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "biter-egg",
        "name": "Biter Egg",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 25,
        "type": "item"
      },
      {
        "id": "capture-robot-rocket",
        "name": "Capture Robot Rocket",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "uranium-235",
        "name": "Uranium 235",
        "amount": 3,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "z[z-biolab]"
  },
  {
    "id": "captive-biter-spawner",
    "name": "Captive Biter Spawner",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "biter-egg",
        "name": "Biter Egg",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "capture-robot-rocket",
        "name": "Capture Robot Rocket",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "uranium-235",
        "name": "Uranium 235",
        "amount": 15,
        "type": "item"
      },
      {
        "id": "fluoroketone-cold",
        "name": "Fluoroketone Cold",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "agriculture",
    "subgroupOrder": "da",
    "itemOrder": "z[biter-nest]"
  },
  {
    "id": "raw-fish",
    "name": "Raw Fish",
    "resultAmount": 3,
    "ingredients": [
      {
        "id": "raw-fish",
        "name": "Raw Fish",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "nutrients",
        "name": "Nutrients",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 6,
    "isFluid": false,
    "subgroup": "raw-resource",
    "subgroupOrder": "b",
    "itemOrder": "h[raw-fish]"
  },
  {
    "id": "lightning-rod",
    "name": "Lightning Rod",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-cable",
        "name": "Copper Cable",
        "amount": 12,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "stone-brick",
        "name": "Stone Brick",
        "amount": 4,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "environmental-protection",
    "subgroupOrder": "f",
    "itemOrder": "a[lightning-rod]"
  },
  {
    "id": "holmium-solution",
    "name": "Holmium Solution",
    "resultAmount": 100,
    "ingredients": [
      {
        "id": "holmium-ore",
        "name": "Holmium Ore",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "stone",
        "name": "Stone",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "water",
        "name": "Water",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 10,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "b[new-fluid]-c[fulgora]-a[holmium-solution]"
  },
  {
    "id": "holmium-plate",
    "name": "Holmium Plate",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "holmium-solution",
        "name": "Holmium Solution",
        "amount": 20,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 1,
    "isFluid": false,
    "subgroup": "fulgora-processes",
    "subgroupOrder": "l",
    "itemOrder": "b[holmium]-c[holmium-plate]"
  },
  {
    "id": "electromagnetic-plant",
    "name": "Electromagnetic Plant",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "holmium-plate",
        "name": "Holmium Plate",
        "amount": 150,
        "type": "item"
      },
      {
        "id": "steel-plate",
        "name": "Steel Plate",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 50,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "g[electromagnetic-plant]"
  },
  {
    "id": "superconductor",
    "name": "Superconductor",
    "resultAmount": 2,
    "ingredients": [
      {
        "id": "holmium-plate",
        "name": "Holmium Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "copper-plate",
        "name": "Copper Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "plastic-bar",
        "name": "Plastic Bar",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "light-oil",
        "name": "Light Oil",
        "amount": 5,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "fulgora-processes",
    "subgroupOrder": "l",
    "itemOrder": "b[holmium]-d[superconductor]"
  },
  {
    "id": "supercapacitor",
    "name": "Supercapacitor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "holmium-plate",
        "name": "Holmium Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "electronic-circuit",
        "name": "Electronic Circuit",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "battery",
        "name": "Battery",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electrolyte",
        "name": "Electrolyte",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "fulgora-processes",
    "subgroupOrder": "l",
    "itemOrder": "b[holmium]-f[supercapacitor]"
  },
  {
    "id": "electrolyte",
    "name": "Electrolyte",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "stone",
        "name": "Stone",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "heavy-oil",
        "name": "Heavy Oil",
        "amount": 10,
        "type": "fluid"
      },
      {
        "id": "holmium-solution",
        "name": "Holmium Solution",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 5,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "b[new-fluid]-c[fulgora]-b[electrolyte]"
  },
  {
    "id": "lightning-collector",
    "name": "Lightning Collector",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "lightning-rod",
        "name": "Lightning Rod",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "supercapacitor",
        "name": "Supercapacitor",
        "amount": 8,
        "type": "item"
      },
      {
        "id": "accumulator",
        "name": "Accumulator",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electrolyte",
        "name": "Electrolyte",
        "amount": 80,
        "type": "fluid"
      }
    ],
    "group": "production",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "environmental-protection",
    "subgroupOrder": "f",
    "itemOrder": "b[lightning-collector]"
  },
  {
    "id": "teslagun",
    "name": "Teslagun",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "holmium-plate",
        "name": "Holmium Plate",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "plastic-bar",
        "name": "Plastic Bar",
        "amount": 30,
        "type": "item"
      },
      {
        "id": "electrolyte",
        "name": "Electrolyte",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "combat",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "gun",
    "subgroupOrder": "a",
    "itemOrder": "a[basic-clips]-h[teslagun]"
  },
  {
    "id": "tesla-turret",
    "name": "Tesla Turret",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "teslagun",
        "name": "Teslagun",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "supercapacitor",
        "name": "Supercapacitor",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 50,
        "type": "item"
      },
      {
        "id": "electrolyte",
        "name": "Electrolyte",
        "amount": 500,
        "type": "fluid"
      }
    ],
    "group": "combat",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "turret",
    "subgroupOrder": "i",
    "itemOrder": "b[turret]-f[tesla-turret]-a[turret]"
  },
  {
    "id": "tesla-ammo",
    "name": "Tesla Ammo",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "supercapacitor",
        "name": "Supercapacitor",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "plastic-bar",
        "name": "Plastic Bar",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "electrolyte",
        "name": "Electrolyte",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "combat",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "ammo",
    "subgroupOrder": "b",
    "itemOrder": "e[railgun-ammo]-a[basic]"
  },
  {
    "id": "heating-tower",
    "name": "Heating Tower",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "boiler",
        "name": "Boiler",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "heat-pipe",
        "name": "Heat Pipe",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "concrete",
        "name": "Concrete",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "environmental-protection",
    "subgroupOrder": "f",
    "itemOrder": "c[heating-tower]"
  },
  {
    "id": "lithium",
    "name": "Lithium",
    "resultAmount": 5,
    "ingredients": [
      {
        "id": "holmium-plate",
        "name": "Holmium Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "lithium-brine",
        "name": "Lithium Brine",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "ammonia",
        "name": "Ammonia",
        "amount": 50,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 20,
    "isFluid": false,
    "subgroup": "aquilo-processes",
    "subgroupOrder": "p",
    "itemOrder": "c[lithium]-a[lithium]"
  },
  {
    "id": "lithium-plate",
    "name": "Lithium Plate",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "lithium",
        "name": "Lithium",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 6.4,
    "isFluid": false,
    "subgroup": "aquilo-processes",
    "subgroupOrder": "p",
    "itemOrder": "c[lithium]-b[lithium-plate]"
  },
  {
    "id": "fluoroketone-hot",
    "name": "Fluoroketone Hot",
    "resultAmount": 50,
    "ingredients": [
      {
        "id": "fluorine",
        "name": "Fluorine",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "ammonia",
        "name": "Ammonia",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "solid-fuel",
        "name": "Solid Fuel",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "lithium",
        "name": "Lithium",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "fluids",
    "craftingTime": 10,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "b[new-fluid]-e[aquilo]-d[fluoroketone-hot]"
  },
  {
    "id": "fluoroketone-cold",
    "name": "Fluoroketone Cold",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "fluoroketone-hot",
        "name": "Fluoroketone Hot",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "fluids",
    "craftingTime": 5,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "b[new-fluid]-e[aquilo]-e[fluoroketone-cold]"
  },
  {
    "id": "cryogenic-plant",
    "name": "Cryogenic Plant",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "refined-concrete",
        "name": "Refined Concrete",
        "amount": 40,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "lithium-plate",
        "name": "Lithium Plate",
        "amount": 20,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "production-machine",
    "subgroupOrder": "e",
    "itemOrder": "h[cryogenic-plant]"
  },
  {
    "id": "quantum-processor",
    "name": "Quantum Processor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-carbide",
        "name": "Tungsten Carbide",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "processing-unit",
        "name": "Processing Unit",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "carbon-fiber",
        "name": "Carbon Fiber",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "lithium-plate",
        "name": "Lithium Plate",
        "amount": 2,
        "type": "item"
      },
      {
        "id": "fluoroketone-cold",
        "name": "Fluoroketone Cold",
        "amount": 10,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "aquilo-processes",
    "subgroupOrder": "p",
    "itemOrder": "c[lithium]-c[quantum-processor]"
  },
  {
    "id": "fusion-reactor-equipment",
    "name": "Fusion Reactor Equipment",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "fission-reactor-equipment",
        "name": "Fission Reactor Equipment",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "fusion-power-cell",
        "name": "Fusion Power Cell",
        "amount": 10,
        "type": "item"
      },
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 250,
        "type": "item"
      },
      {
        "id": "carbon-fiber",
        "name": "Carbon Fiber",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "supercapacitor",
        "name": "Supercapacitor",
        "amount": 25,
        "type": "item"
      },
      {
        "id": "quantum-processor",
        "name": "Quantum Processor",
        "amount": 250,
        "type": "item"
      }
    ],
    "group": "combat",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "equipment",
    "subgroupOrder": "e",
    "itemOrder": "a[energy-source]-c[fusion-reactor]"
  },
  {
    "id": "fusion-power-cell",
    "name": "Fusion Power Cell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "lithium-plate",
        "name": "Lithium Plate",
        "amount": 5,
        "type": "item"
      },
      {
        "id": "holmium-plate",
        "name": "Holmium Plate",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "ammonia",
        "name": "Ammonia",
        "amount": 100,
        "type": "fluid"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 10,
    "isFluid": false,
    "subgroup": "aquilo-processes",
    "subgroupOrder": "p",
    "itemOrder": "c[lithium]-d[fusion-power-cell]"
  },
  {
    "id": "fusion-reactor",
    "name": "Fusion Reactor",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 200,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 200,
        "type": "item"
      },
      {
        "id": "quantum-processor",
        "name": "Quantum Processor",
        "amount": 250,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 60,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "g[fusion-energy]-a[reactor]"
  },
  {
    "id": "fusion-generator",
    "name": "Fusion Generator",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "superconductor",
        "name": "Superconductor",
        "amount": 100,
        "type": "item"
      },
      {
        "id": "quantum-processor",
        "name": "Quantum Processor",
        "amount": 50,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "energy",
    "subgroupOrder": "b",
    "itemOrder": "g[fusion-energy]-b[generator]"
  },
  {
    "id": "ice-platform",
    "name": "Ice Platform",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "ammonia",
        "name": "Ammonia",
        "amount": 400,
        "type": "fluid"
      },
      {
        "id": "ice",
        "name": "Ice",
        "amount": 50,
        "type": "item"
      }
    ],
    "group": "logistics",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "c[landfill]-f[ice-platform]"
  },
  {
    "id": "foundation",
    "name": "Foundation",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-plate",
        "name": "Tungsten Plate",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "lithium-plate",
        "name": "Lithium Plate",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "carbon-fiber",
        "name": "Carbon Fiber",
        "amount": 4,
        "type": "item"
      },
      {
        "id": "stone",
        "name": "Stone",
        "amount": 20,
        "type": "item"
      },
      {
        "id": "fluoroketone-cold",
        "name": "Fluoroketone Cold",
        "amount": 20,
        "type": "fluid"
      }
    ],
    "group": "logistics",
    "craftingTime": 30,
    "isFluid": false,
    "subgroup": "terrain",
    "subgroupOrder": "i",
    "itemOrder": "c[landfill]-g[foundation]"
  },
  {
    "id": "promethium-science-pack",
    "name": "Promethium Science Pack",
    "resultAmount": 10,
    "ingredients": [
      {
        "id": "promethium-asteroid-chunk",
        "name": "Promethium Asteroid Chunk",
        "amount": 25,
        "type": "item"
      },
      {
        "id": "quantum-processor",
        "name": "Quantum Processor",
        "amount": 1,
        "type": "item"
      },
      {
        "id": "biter-egg",
        "name": "Biter Egg",
        "amount": 10,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 5,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "l"
  },
  {
    "id": "tree-seed",
    "name": "Tree Seed",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "wood",
        "name": "Wood",
        "amount": 2,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 2,
    "isFluid": false,
    "subgroup": "nauvis-agriculture",
    "subgroupOrder": "o",
    "itemOrder": "a[seeds]-b[tree-seed]"
  },
  {
    "id": "water-barrel",
    "name": "Water Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "water",
        "name": "Water",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "a[fluid]-a[water]-a[water]"
  },
  {
    "id": "sulfuric-acid-barrel",
    "name": "Sulfuric Acid Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "sulfuric-acid",
        "name": "Sulfuric Acid",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "a[fluid]-b[oil]-f[sulfuric-acid]"
  },
  {
    "id": "crude-oil-barrel",
    "name": "Crude Oil Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "crude-oil",
        "name": "Crude Oil",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "a[fluid]-b[oil]-a[crude-oil]"
  },
  {
    "id": "crude-oil",
    "name": "Crude Oil",
    "resultAmount": 50,
    "ingredients": [
      {
        "id": "crude-oil-barrel",
        "name": "Crude Oil Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "fluids",
    "craftingTime": 0.2,
    "isFluid": true,
    "subgroup": "fluid",
    "subgroupOrder": "a",
    "itemOrder": "a[fluid]-b[oil]-a[crude-oil]"
  },
  {
    "id": "heavy-oil-barrel",
    "name": "Heavy Oil Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "heavy-oil",
        "name": "Heavy Oil",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "a[fluid]-b[oil]-d[heavy-oil]"
  },
  {
    "id": "light-oil-barrel",
    "name": "Light Oil Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "light-oil",
        "name": "Light Oil",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "a[fluid]-b[oil]-c[light-oil]"
  },
  {
    "id": "petroleum-gas-barrel",
    "name": "Petroleum Gas Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "petroleum-gas",
        "name": "Petroleum Gas",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "a[fluid]-b[oil]-b[petroleum-gas]"
  },
  {
    "id": "lubricant-barrel",
    "name": "Lubricant Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "lubricant",
        "name": "Lubricant",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "a[fluid]-b[oil]-e[lubricant]"
  },
  {
    "id": "fluoroketone-cold-barrel",
    "name": "Fluoroketone Cold Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "fluoroketone-cold",
        "name": "Fluoroketone Cold",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "b[new-fluid]-e[aquilo]-e[fluoroketone-cold]"
  },
  {
    "id": "fluoroketone-hot-barrel",
    "name": "Fluoroketone Hot Barrel",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "fluoroketone-hot",
        "name": "Fluoroketone Hot",
        "amount": 50,
        "type": "fluid"
      },
      {
        "id": "barrel",
        "name": "Barrel",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.2,
    "isFluid": false,
    "subgroup": "barrel",
    "subgroupOrder": "d",
    "itemOrder": "b[new-fluid]-e[aquilo]-d[fluoroketone-hot]"
  },
  {
    "id": "wood",
    "name": "Wood",
    "resultAmount": 0.5,
    "ingredients": [
      {
        "id": "wooden-chest",
        "name": "Wooden Chest",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "raw-resource",
    "subgroupOrder": "b",
    "itemOrder": "a[wood]"
  },
  {
    "id": "stone",
    "name": "Stone",
    "resultAmount": 1.25,
    "ingredients": [
      {
        "id": "stone-furnace",
        "name": "Stone Furnace",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "raw-resource",
    "subgroupOrder": "b",
    "itemOrder": "d[stone]"
  },
  {
    "id": "spoilage",
    "name": "Spoilage",
    "resultAmount": 2.5,
    "ingredients": [
      {
        "id": "nutrients",
        "name": "Nutrients",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.125,
    "isFluid": false,
    "subgroup": "agriculture-processes",
    "subgroupOrder": "m",
    "itemOrder": "c[nutrients]-a[spoilage]"
  },
  {
    "id": "blueprint",
    "name": "Blueprint",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "blueprint",
        "name": "Blueprint",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "",
    "subgroupOrder": "",
    "itemOrder": ""
  },
  {
    "id": "blueprint-book",
    "name": "Blueprint Book",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "blueprint-book",
        "name": "Blueprint Book",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "",
    "subgroupOrder": "",
    "itemOrder": ""
  },
  {
    "id": "yumako",
    "name": "Yumako",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "yumako",
        "name": "Yumako",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "agriculture-processes",
    "subgroupOrder": "m",
    "itemOrder": "b[agriculture]-a[yumako]"
  },
  {
    "id": "jellynut",
    "name": "Jellynut",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "jellynut",
        "name": "Jellynut",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "agriculture-processes",
    "subgroupOrder": "m",
    "itemOrder": "b[agriculture]-b[jellynut]"
  },
  {
    "id": "yumako-mash",
    "name": "Yumako Mash",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "yumako-mash",
        "name": "Yumako Mash",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "agriculture-products",
    "subgroupOrder": "n",
    "itemOrder": "a[organic-processing]-c[yumako-mash]"
  },
  {
    "id": "jelly",
    "name": "Jelly",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "jelly",
        "name": "Jelly",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "agriculture-products",
    "subgroupOrder": "n",
    "itemOrder": "a[organic-processing]-d[jelly]"
  },
  {
    "id": "deconstruction-planner",
    "name": "Deconstruction Planner",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "deconstruction-planner",
        "name": "Deconstruction Planner",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "",
    "subgroupOrder": "",
    "itemOrder": ""
  },
  {
    "id": "item-unknown",
    "name": "Item Unknown",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "item-unknown",
        "name": "Item Unknown",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "",
    "subgroupOrder": "",
    "itemOrder": ""
  },
  {
    "id": "copper-ore",
    "name": "Copper Ore",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "copper-ore",
        "name": "Copper Ore",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "raw-resource",
    "subgroupOrder": "b",
    "itemOrder": "f[copper-ore]"
  },
  {
    "id": "uranium-ore",
    "name": "Uranium Ore",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "uranium-ore",
        "name": "Uranium Ore",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "raw-resource",
    "subgroupOrder": "b",
    "itemOrder": "g[uranium-ore]"
  },
  {
    "id": "lane-splitter",
    "name": "Lane Splitter",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "lane-splitter",
        "name": "Lane Splitter",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "b[items]-b[lane-splitter]"
  },
  {
    "id": "coin",
    "name": "Coin",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "coin",
        "name": "Coin",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "y"
  },
  {
    "id": "electric-energy-interface",
    "name": "Electric Energy Interface",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "electric-energy-interface",
        "name": "Electric Energy Interface",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "a[electric-energy-interface]-b[electric-energy-interface]"
  },
  {
    "id": "depleted-uranium-fuel-cell",
    "name": "Depleted Uranium Fuel Cell",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "depleted-uranium-fuel-cell",
        "name": "Depleted Uranium Fuel Cell",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "uranium-processing",
    "subgroupOrder": "i",
    "itemOrder": "b[uranium-products]-b[depleted-uranium-fuel-cell]"
  },
  {
    "id": "simple-entity-with-force",
    "name": "Simple Entity With Force",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "simple-entity-with-force",
        "name": "Simple Entity With Force",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "s[simple-entity-with-force]-f[simple-entity-with-force]"
  },
  {
    "id": "simple-entity-with-owner",
    "name": "Simple Entity With Owner",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "simple-entity-with-owner",
        "name": "Simple Entity With Owner",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "s[simple-entity-with-owner]-o[simple-entity-with-owner]"
  },
  {
    "id": "infinity-cargo-wagon",
    "name": "Infinity Cargo Wagon",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "infinity-cargo-wagon",
        "name": "Infinity Cargo Wagon",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "c[item]-o[infinity-cargo-wagon]"
  },
  {
    "id": "burner-generator",
    "name": "Burner Generator",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "burner-generator",
        "name": "Burner Generator",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "t[item]-o[burner-generator]"
  },
  {
    "id": "linked-chest",
    "name": "Linked Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "linked-chest",
        "name": "Linked Chest",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "a[items]-a[linked-chest]"
  },
  {
    "id": "proxy-container",
    "name": "Proxy Container",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "proxy-container",
        "name": "Proxy Container",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "a[items]-a[proxy-container]"
  },
  {
    "id": "bottomless-chest",
    "name": "Bottomless Chest",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "bottomless-chest",
        "name": "Bottomless Chest",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "a[items]-c[bottomless-chest]"
  },
  {
    "id": "linked-belt",
    "name": "Linked Belt",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "linked-belt",
        "name": "Linked Belt",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "b[items]-b[linked-belt]"
  },
  {
    "id": "one-way-valve",
    "name": "One Way Valve",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "one-way-valve",
        "name": "One Way Valve",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "b[items]-o[one-way-valve]"
  },
  {
    "id": "overflow-valve",
    "name": "Overflow Valve",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "overflow-valve",
        "name": "Overflow Valve",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "b[items]-o[overflow-valve]"
  },
  {
    "id": "top-up-valve",
    "name": "Top Up Valve",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "top-up-valve",
        "name": "Top Up Valve",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "b[items]-o[top-up-valve]"
  },
  {
    "id": "empty-module-slot",
    "name": "Empty Module Slot",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "empty-module-slot",
        "name": "Empty Module Slot",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "production",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "module",
    "subgroupOrder": "g",
    "itemOrder": "z[meta]-a[empty-module-slot]"
  },
  {
    "id": "science",
    "name": "Science",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "science",
        "name": "Science",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "science-pack",
    "subgroupOrder": "y",
    "itemOrder": "zz[science]"
  },
  {
    "id": "promethium-asteroid-chunk",
    "name": "Promethium Asteroid Chunk",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "promethium-asteroid-chunk",
        "name": "Promethium Asteroid Chunk",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "space-material",
    "subgroupOrder": "g",
    "itemOrder": "d[promethium]-e[chunk]"
  },
  {
    "id": "calcite",
    "name": "Calcite",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "calcite",
        "name": "Calcite",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "vulcanus-processes",
    "subgroupOrder": "k",
    "itemOrder": "a[melting]-a[calcite]"
  },
  {
    "id": "tungsten-ore",
    "name": "Tungsten Ore",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "tungsten-ore",
        "name": "Tungsten Ore",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "vulcanus-processes",
    "subgroupOrder": "k",
    "itemOrder": "c[tungsten]-a[tungsten-ore]"
  },
  {
    "id": "biter-egg",
    "name": "Biter Egg",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "biter-egg",
        "name": "Biter Egg",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.625,
    "isFluid": false,
    "subgroup": "agriculture-products",
    "subgroupOrder": "n",
    "itemOrder": "c[eggs]-a[biter-egg]"
  },
  {
    "id": "holmium-ore",
    "name": "Holmium Ore",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "holmium-ore",
        "name": "Holmium Ore",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "intermediate-products",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "fulgora-processes",
    "subgroupOrder": "l",
    "itemOrder": "b[holmium]-a[holmium-ore]"
  },
  {
    "id": "space-platform-hub",
    "name": "Space Platform Hub",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "space-platform-hub",
        "name": "Space Platform Hub",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "space",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "space-related",
    "subgroupOrder": "e",
    "itemOrder": ""
  },
  {
    "id": "selection-tool",
    "name": "Selection Tool",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "selection-tool",
        "name": "Selection Tool",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "e[automated-construction]-a[blueprint]"
  },
  {
    "id": "fp_beacon_selector",
    "name": "Fp_beacon_selector",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "fp_beacon_selector",
        "name": "Fp_beacon_selector",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "other",
    "subgroupOrder": "d",
    "itemOrder": "z_fp1"
  },
  {
    "id": "upgrade-planner",
    "name": "Upgrade Planner",
    "resultAmount": 1,
    "ingredients": [
      {
        "id": "upgrade-planner",
        "name": "Upgrade Planner",
        "amount": 1,
        "type": "item"
      }
    ],
    "group": "other",
    "craftingTime": 0.03125,
    "isFluid": false,
    "subgroup": "",
    "subgroupOrder": "",
    "itemOrder": ""
  }
]

export const craftableItems = recipes
