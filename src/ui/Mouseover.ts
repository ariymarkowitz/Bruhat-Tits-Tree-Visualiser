import { DisplayObject } from "createjs-module";

export namespace MouseOver {
  type enterEvent = (e: createjs.MouseEvent) => [moveEvent, leaveEvent]
  type moveEvent = (e: createjs.MouseEvent) => void
  type leaveEvent = (e: createjs.MouseEvent) => void

  type mouseoverReturn = [
    (stage: createjs.Stage) => void,
    (object: DisplayObject, onEnter: enterEvent) => void,
    () => void
  ]

  export function createMouseoverHandler(): mouseoverReturn {

    let _stage: createjs.Stage | null = null
    const setStage = (stage: createjs.Stage) => _stage = stage

    const bindHandler = (object: DisplayObject, onEnter: enterEvent) => {
      object.on('mouseover', (event) => {
        const [onMove, onLeave] = onEnter(event as createjs.MouseEvent)
        let myBind: Function
        if (_stage !== null) {
          myBind = _stage.on('stagemousemove', e => onMove(e as createjs.MouseEvent))
        }
        object.on('mouseout', e => {
          if (_stage !== null) {
            _stage.off('stagemousemove', myBind)
          }
          onLeave(e as createjs.MouseEvent)
        }, undefined, true)
      })
    }

    const update = () => _stage?.update()

    return [setStage, bindHandler, update]
  }

  const [_setStage, _bind, _update] = MouseOver.createMouseoverHandler()
  export const setStage = _setStage
  export const bind = _bind
  export const update = _update
}