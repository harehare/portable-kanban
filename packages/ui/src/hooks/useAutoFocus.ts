import * as React from 'react';

export const useAutoFocus = <RefType extends HTMLTextAreaElement>() => {
  const inputRef = React.useRef<RefType>(null);
  React.useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return inputRef;
};

export const useAutoFocusInput = <RefType extends HTMLInputElement>() => {
  const inputRef = React.useRef<RefType>(null);
  React.useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return inputRef;
};
