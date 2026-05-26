import './styles/theme.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { WebApp } from './App';

const root = createRoot(document.querySelector('#root')!);

root.render(<WebApp />);
