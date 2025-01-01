import { useEffect } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import './shared/Variables.scss';
import { Outlet } from 'react-router-dom';
import TitleUpdater from './components/TitleUpdater';

function App() {
  return (
    <div className='appContainer'>
      <TitleUpdater />
      <div>
        <Header />
          <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default App;
