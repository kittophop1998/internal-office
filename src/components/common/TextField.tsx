'use client';

import React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

export interface TextFieldProps<T extends FieldValues = FieldValues>
  extends Omit<MuiTextFieldProps, 'name'> {
  name: Path<T>;
  control?: Control<T>;
}

/**
 * TextField component ที่ทำงานร่วมกับ react-hook-form
 */
export function TextField<T extends FieldValues = FieldValues>({
  name,
  control,
  ...props
}: TextFieldProps<T>) {
  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <MuiTextField
            {...field}
            {...props}
            error={!!error}
            helperText={error?.message || props.helperText}
          />
        )}
      />
    );
  }

  return <MuiTextField {...props} />;
}
