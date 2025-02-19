import './main.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.tsx';
import { AppPresenter } from './app_presenter.ts';

const presenter = new AppPresenter();

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App presenter={presenter} />
  </StrictMode>
);
