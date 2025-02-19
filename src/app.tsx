import { AppPresenter } from "./app_presenter.ts";

export interface AppProps {
  presenter: AppPresenter;
}

export function App({ presenter }: AppProps) {
  return "Hello World";
}
