import { registerRootComponent } from 'expo';
import App from './App';

// Register the main component
registerRootComponent(App);

// Add this for Electron support
if (module.hot) {
  module.hot.accept();
}
