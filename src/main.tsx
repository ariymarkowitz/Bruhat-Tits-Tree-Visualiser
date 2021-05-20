// import { rationalField } from './Field/Rational';
// import * as createjs from 'createjs-module';
// import UITree from './ui/UITree/UITree';
// import { MouseOver } from './ui/Mouseover';
// import { tooltip } from './ui/Tooltip';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

ReactDOM.render(<App />, document.getElementById('root'));

// const stage = new createjs.Stage('canvas')
// stage.enableMouseOver()
// let canvas = stage.canvas as HTMLCanvasElement
// let dpr = window.devicePixelRatio || 1

// MouseOver.setStage(stage)

// const width = 1000
// const height = 800
// canvas.width = width * dpr
// canvas.height = height * dpr
// canvas.style.width = width.toString()
// canvas.style.height = height.toString()
// stage.scaleX = stage.scaleY = dpr

// let uiTree = new UITree(2, 7)
// const R = rationalField
// const F = uiTree.btt.field
// const V = uiTree.btt.vspace

// uiTree.end = [F.fromRational(R.reduce(2, 3)), F.fromRational(R.reduce(3,5))]

// let treeContainer = uiTree.draw()
// treeContainer.x = width / 2
// treeContainer.y = height / 2
// stage.addChild(treeContainer)

// stage.addChild(tooltip)
// stage.update()