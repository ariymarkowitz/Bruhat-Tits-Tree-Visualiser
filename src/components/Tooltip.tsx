import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Group, Image, Rect } from 'react-konva';
import { theme } from '../style/themes/themes';
import { latexToImg } from './LatexToImg';

type props = {
  padding?: number
  text?: string,
  visible?: boolean
  x: number,
  y: number,
}

const defaultProps = {
  padding: 5,
  text: '',
  visible: false
}

export const Tooltip = (props: props) => {
  const _props = {...defaultProps, ...props}
  const [image, setImage] = useState<HTMLCanvasElement | null>(null)
  const [_visible, set_visible] = useState<boolean>()
  const loadImage = useMemo(() => latexToImg(_props.text), [_props.text])
  useEffect(() => {loadImage.then(result => {
    if (result.width !== 0 && result.height !== 0) {
      setImage(result)
    } else {
      setImage(null)
    }
    set_visible(_props.visible)
  })}, [loadImage, _props.visible])
  const padding = props.padding || 5;
  if (image !== null) {
    const dpr = window.devicePixelRatio
    return (
      <Group x={_props.x} y={_props.y} visible={_visible} opacity={0.8} scaleX={1/dpr} scaleY={1/dpr}>
        <Rect
          width={image.width + 2*padding}
          height={image.height + 2*padding}
          strokeWidth={1}
          stroke={theme.colors.border}
          fill={theme.colors.background}
        />
        <Image image={image} x={padding} y={padding} />
      </Group>
    )
  } else {
    return <></>
  }
}

export namespace MainTooltip {
  type Dispatch<T> = React.Dispatch<React.SetStateAction<T>>
  export type context = {
    setX?: Dispatch<number>,
    setY?: Dispatch<number>,
    setText?: Dispatch<string>,
    setVisible?: Dispatch<boolean>,
  }

  export const ContextContainer = React.createContext<context | null>({})
}