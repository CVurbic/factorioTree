export interface FactorioNodeData {
  name: string
  recipeId: string
  amount: number
  isRaw: boolean
  group: string
  isFluid: boolean
  craftingTime: number
  isCollapsed: boolean
  hasChildren: boolean
  resultAmount: number
  allIngredients: Array<{ id: string; name: string; amount: number; type: string }>
  onToggleCollapse: (recipeId: string) => void
  onAddItem: (itemId: string) => void
  [key: string]: unknown
}
