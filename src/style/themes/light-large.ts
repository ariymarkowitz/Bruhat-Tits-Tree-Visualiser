import light from './light'
import type { Theme } from './themes'

export default {
  ...light,
  name: 'Light Large',
  tree: { ...light.tree, branchWidth: 8, vertexStrokeWidth: 4, vertexRadius: 14 }
} satisfies Theme
