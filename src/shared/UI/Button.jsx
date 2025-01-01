import React from 'react'

const Button = ({children, secondary, disabled, single, onClick}) => {

    const wideStyles = {
        padding: '10px 20px', 
        border: secondary ? disabled ? '1px solid var(--sec-color)' : '1px solid var(--main-color)' : 'none', 
        fontSize: '12px', 
        fontWeight: 600, 
        color: secondary && !disabled ? 'var(--main-color)' : disabled ? 'var(--sec-color)' : 'var(--main-bg-color)',
        backgroundColor: secondary ? 'var(--main-bg-color)' : disabled ? 'var(--border-color)' : 'var(--main-color)',
        width: '100%',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
    }

    const singleStyles = {
        border: secondary ? disabled ? '1px solid var(--sec-color)' : '1px solid var(--main-color)' : 'none', 
        fontSize: '12px', 
        fontWeight: 600, 
        color: secondary && !disabled ? 'var(--main-color)' : disabled ? 'var(--sec-color)' : 'var(--main-bg-color)',
        backgroundColor: secondary ? 'var(--main-bg-color)' : disabled ? 'var(--border-color)' : 'var(--main-color)',
        width: '32px',
        height: '32px',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
    }

  return (
    <button onClick={onClick} disabled={disabled} secondary={secondary} style={ single ? singleStyles : wideStyles}>{children}</button>
  )
}

export default Button