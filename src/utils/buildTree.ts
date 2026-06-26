import type { Node, Edge } from '@xyflow/react'
import type { Recipe } from '../data/recipes-generated'
import type { FactorioNodeData } from '../types'

const COLUMN_WIDTH = 250
const ROW_HEIGHT = 120
const MAX_DEPTH = 20

interface TreeNode {
  uid: string
  recipeId: string
  name: string
  amount: number
  children: TreeNode[]
  depth: number
  group: string
  isFluid: boolean
  craftingTime: number
  resultAmount: number
  allIngredients: Array<{ id: string; name: string; amount: number; type: string }>
  hasChildren: boolean
  isCollapsed: boolean
  y?: number
}

function getMaxDepth(node: TreeNode): number {
  if (node.children.length === 0) return node.depth
  return Math.max(...node.children.map(getMaxDepth))
}

function assignY(node: TreeNode, leafCounter: { val: number }): void {
  if (node.children.length === 0) {
    node.y = leafCounter.val * ROW_HEIGHT
    leafCounter.val++
    return
  }
  node.children.forEach(c => assignY(c, leafCounter))
  const firstY = node.children[0].y!
  const lastY = node.children[node.children.length - 1].y!
  node.y = (firstY + lastY) / 2
}

export function buildFlowElements(
  rootId: string,
  quantity: number,
  recipes: Recipe[],
  collapsedIds: Set<string>,
  onToggleCollapse: (recipeId: string) => void,
  onExtendToParent: (newRootId: string) => void,
): { nodes: Node<FactorioNodeData>[]; edges: Edge[] } {
  const recipeMap = new Map(recipes.map(r => [r.id, r]))
  let uidCounter = 0

  function buildTreeNode(
    itemId: string,
    amount: number,
    depth: number,
    visited: ReadonlySet<string> = new Set(),
  ): TreeNode {
    const recipe = recipeMap.get(itemId)
    const uid = `${itemId}-${uidCounter++}`

    const isLeaf = !recipe || recipe.ingredients.length === 0 || visited.has(itemId) || depth >= MAX_DEPTH
    const willBeCollapsed = !isLeaf && collapsedIds.has(itemId)

    if (isLeaf) {
      return {
        uid, recipeId: itemId,
        name: recipe?.name ?? itemId,
        amount,
        children: [],
        depth,
        group: recipe?.group ?? 'other',
        isFluid: recipe?.isFluid ?? false,
        craftingTime: recipe?.craftingTime ?? 0.5,
        resultAmount: recipe?.resultAmount ?? 1,
        allIngredients: recipe?.ingredients.map(i => ({ id: i.id, name: i.name, amount: i.amount, type: i.type })) ?? [],
        hasChildren: false,
        isCollapsed: false,
      }
    }

    const craftsNeeded = amount / recipe!.resultAmount

    let children: TreeNode[] = []
    if (!willBeCollapsed) {
      const nextVisited = new Set(visited)
      nextVisited.add(itemId)
      children = recipe!.ingredients.map(ing =>
        buildTreeNode(ing.id, craftsNeeded * ing.amount, depth + 1, nextVisited),
      )
    }

    return {
      uid,
      recipeId: itemId,
      name: recipe!.name,
      amount,
      children,
      depth,
      group: recipe!.group,
      isFluid: recipe!.isFluid,
      craftingTime: recipe!.craftingTime,
      resultAmount: recipe!.resultAmount,
      allIngredients: recipe!.ingredients.map(i => ({ id: i.id, name: i.name, amount: i.amount, type: i.type })),
      hasChildren: true,
      isCollapsed: willBeCollapsed,
    }
  }

  const root = buildTreeNode(rootId, quantity, 0)
  const maxDepth = getMaxDepth(root)
  assignY(root, { val: 0 })

  const nodes: Node<FactorioNodeData>[] = []
  const edges: Edge[] = []

  function traverse(node: TreeNode) {
    const x = (maxDepth - node.depth) * COLUMN_WIDTH

    nodes.push({
      id: node.uid,
      type: 'factorioNode',
      position: { x, y: node.y! },
      data: {
        name: node.name,
        recipeId: node.recipeId,
        amount: node.amount,
        isRaw: !node.hasChildren,
        group: node.group,
        isFluid: node.isFluid,
        craftingTime: node.craftingTime,
        isCollapsed: node.isCollapsed,
        hasChildren: node.hasChildren,
        resultAmount: node.resultAmount,
        allIngredients: node.allIngredients,
        onToggleCollapse,
        onExtendToParent,
      },
    })

    node.children.forEach(child => {
      traverse(child)
      edges.push({
        id: `e-${child.uid}__${node.uid}`,
        source: child.uid,
        target: node.uid,
        sourceHandle: 'right',
        targetHandle: 'left',
        type: 'conveyor',
      })
    })
  }

  traverse(root)
  return { nodes, edges }
}

// ── raw material totals ───────────────────────────────────────────────────────

export interface RawMaterial {
  id: string
  name: string
  amount: number
  isFluid: boolean
}

export function getRawMaterials(
  rootId: string,
  quantity: number,
  recipes: Recipe[],
): RawMaterial[] {
  const totals = new Map<string, { name: string; amount: number; isFluid: boolean }>()
  const recipeMap = new Map(recipes.map(r => [r.id, r]))

  function walk(itemId: string, needed: number, visited: ReadonlySet<string>) {
    const recipe = recipeMap.get(itemId)
    if (!recipe || recipe.ingredients.length === 0 || visited.has(itemId)) {
      const existing = totals.get(itemId)
      if (existing) existing.amount += needed
      else totals.set(itemId, { name: recipe?.name ?? itemId, amount: needed, isFluid: recipe?.isFluid ?? false })
      return
    }
    const craftsNeeded = needed / recipe.resultAmount
    const next = new Set(visited)
    next.add(itemId)
    for (const ing of recipe.ingredients) {
      walk(ing.id, craftsNeeded * ing.amount, next)
    }
  }

  walk(rootId, quantity, new Set())

  return Array.from(totals.entries())
    .map(([id, v]) => ({ id, name: v.name, amount: v.amount, isFluid: v.isFluid }))
    .sort((a, b) => b.amount - a.amount)
}
