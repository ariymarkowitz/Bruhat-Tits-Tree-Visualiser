import light from './light'
export default {
  ...light,
  name: 'Light Large',
  tree: { ...light.tree, branchWidth: 8, vertexStrokeWidth: 4, vertexRadius: 14 }
}
