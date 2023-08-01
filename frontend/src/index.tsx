import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import the Router component
import App from './App';

<link rel="icon" href="assets/icon.png" />

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <Router> {/* Wrap the App component with the Router */}
      <App />
    </Router>
  );
}
