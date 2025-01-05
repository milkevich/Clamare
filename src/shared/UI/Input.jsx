// src/shared/UI/Input.jsx
import { TextField } from '@mui/material';
import React from 'react';

const Input = ({
  value,
  onChange,
  label,
  type = 'text',
  outlined = true,
  error = false,
  helperText = '',
  name,
  required = false,
  white,
  placeholder,
  ...props
}) => {
  return (
    <>
      {outlined ? (
        <TextField
          name={name}
          error={error}
          type={type}
          value={value}
          onChange={onChange}
          label={label}
          variant="outlined"
          fullWidth
          required={required}
          helperText={helperText}
          {...props}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              height: '50px',
              padding: '0px',
              fontSize: '10px',
              boxSizing: 'border-box',
              fontWeight: '580',
              '& fieldset': {
                borderColor: 'var(--border-color)',
              },
              '&:hover fieldset': {
                borderColor: 'lightgrey',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--main-color)',
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'var(--main-color)',
              fontSize: '12px',
              transition: 'ease-in-out 0.2s all',
              marginTop: value ? '5px' : '0px',
              fontWeight: '600',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'var(--main-color)',
              fontSize: '12px',
              marginTop: '5px',
            },
            '& .MuiInputLabel-shrink': {
              marginTop: '5px',
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px var(--sec-bg-color) inset',
              WebkitTextFillColor: 'var(--main-color)',
              transition: 'background-color 5000s ease-in-out 0s',
            },
          }}
        />
      ) : (
        <TextField
          name={name}
          error={error}
          type={type}
          value={value}
          onChange={onChange}
          label={label}
          variant="standard"
          fullWidth
          required={required}
          helperText={helperText}
          {...props} // Forward additional props
          placeholder={placeholder}
          sx={{
            input: {
              color: white ? 'var(--main-bg-color)' : 'var(--main-color)',
              fontSize: '12px',
            },
            '& .MuiInputLabel-root': {
              color: white ? 'var(--main-bg-color)' : 'var(--main-color)',
              fontSize: '12px',
              transition: 'ease-in-out 0.2s all',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: white ? 'var(--main-bg-color)' : 'var(--main-color)',
              fontSize: '14px',
              transition: 'ease-in-out 0.2s all',
            },
            '& .MuiInput-underline:before': {
              borderBottomColor: white ? 'var(--main-bg-color)' : 'var(--border-color)',
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: white ? 'var(--main-bg-color)' : 'var(--main-color)',
              borderBottomWidth: '1px',
            },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              borderBottomColor: white ? 'var(--sec-color)' : 'lightgrey',
              borderBottomWidth: '1px',
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px var(--sec-bg-color) inset',
              WebkitTextFillColor: white ? 'var(--main-bg-color)' : 'var(--main-color)',
              transition: 'background-color 5000s ease-in-out 0s',
            },
          }}
        />
      )}
    </>
  );
};

export default Input;
