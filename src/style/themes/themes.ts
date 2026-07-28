import darkTheme from './dark'
import lightTheme from './light'
import lightLargeTheme from './light-large'
import mochaTheme from './mocha'

export interface Theme {
  name: string,
  ui: {
    background: string,
    textColor: string,
    border: string,
    focusBorder: string,
    thickBorder: string,
    disabledBorder: string,
    githubColor: 'white' | 'black',
  },
  tree: {
    type0: string,
    type1: string,
    vertexStroke: string,
    edge: string,
    end: string,
    fixedPoints: string,
    translationAxis: string,
    highlightVertex: string,
    branchWidth: number,
    vertexStrokeWidth: number,
    vertexRadius: number,
  }
}

export const themes: Theme[] = [darkTheme, lightTheme, lightLargeTheme, mochaTheme]

export function setTheme(theme: Theme) {
  const cssVariables = {
    bgColor: theme.ui.background,
    borderColor: theme.ui.border,
    focusBorderColor: theme.ui.focusBorder,
    textColor: theme.ui.textColor,
    thickBorderColor: theme.ui.thickBorder,
    disabledBorderColor: theme.ui.disabledBorder,
    fixedPointColor: theme.tree.fixedPoints,
    translationAxisColor: theme.tree.translationAxis,
    endColor: theme.tree.end,
  }
  for (const [name, value] of Object.entries(cssVariables)) {
    document.documentElement.style.setProperty(`--${name}`, value)
  }
}