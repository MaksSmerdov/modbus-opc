import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes/router';

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;