// form.tsx
import React, { FC, ReactNode } from 'react';

interface FormProps extends React.HTMLProps<HTMLFormElement> {
  children: ReactNode;
}

export const Form: FC<FormProps> = ({ children, ...props }) => (
  <form {...props}>{children}</form>
);

interface FormControlProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

export const FormControl: FC<FormControlProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

interface FormFieldProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

export const FormField: FC<FormFieldProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

interface FormItemProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

export const FormItem: FC<FormItemProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

interface FormLabelProps extends React.HTMLProps<HTMLLabelElement> {
  children: ReactNode;
}

export const FormLabel: FC<FormLabelProps> = ({ children, ...props }) => (
  <label {...props}>{children}</label>
);

interface FormMessageProps extends React.HTMLProps<HTMLParagraphElement> {
  children: ReactNode;
}

export const FormMessage: FC<FormMessageProps> = ({ children, ...props }) => (
  <p {...props}>{children}</p>
);
