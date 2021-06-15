import React, { Fragment } from "react";
import { AddClass } from "../utils/AddClass";
import { DivProps, InputProps } from "react-html-props";

export const Sidebar = AddClass('div', 'sidebar')
export const SidebarRow = AddClass('div', 'sidebar-row')
export const SidebarLeft = ({children, ...props}: DivProps) => <div {...props}>{children}</div>
export const SidebarRight = Fragment

interface LabelWithCheckboxProps extends InputProps {
  htmlFor?: string
}

export const LabelWithCheckbox = ({children, htmlFor, ...props}: LabelWithCheckboxProps) => (
  <>
    <div>
      <input type='checkbox' {...props}/>
    </div>
    <label className='with-checkbox' htmlFor={htmlFor}>{children}</label>
  </>
)