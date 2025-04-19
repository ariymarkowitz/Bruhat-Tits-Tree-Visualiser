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
    githubColor: string,
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
  const html = document.documentElement
  html.style.setProperty('--bgColor', theme.ui.background)
  html.style.setProperty('--borderColor', theme.ui.border)
  html.style.setProperty('--focusBorderColor', theme.ui.focusBorder)
  html.style.setProperty('--textColor', theme.ui.textColor)
  html.style.setProperty('--thickBorderColor', theme.ui.thickBorder)
  html.style.setProperty('--fixedPointColor', theme.tree.fixedPoints)
  html.style.setProperty('--translationAxisColor', theme.tree.translationAxis)
  html.style.setProperty('--endColor', theme.tree.end)
}