import React from "react"

type AttributesOf<T> = T extends React.DetailedHTMLFactory<infer P, infer Q> ? P : never

export function AddClass<K extends keyof React.ReactHTML, P extends AttributesOf<React.ReactHTML[K]>>
  (type: K, className: string): React.FC<P> {
    return ({children, ...props}) => React.createElement(type, {
      ...props,
      className: `${className}${props.className ? ` ${props.className}` : ''}`
    }, children)
}