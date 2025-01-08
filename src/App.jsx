import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import TitleUpdater from './components/TitleUpdater';
import WebsitePreviewScreen from './screens/WebsitePreviewScreen';
import { fetchStoreStatus } from './utils/shopify';
import './shared/Variables.scss';
import Loader from './shared/UI/Loader';
import { ToastContainer } from 'react-toastify';

function App() {
  const [storeRunning, setStoreRunning] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoreStatus = async () => {
      try {
        const data = await fetchStoreStatus();

        if (data.length > 0) {
          const fields = data[0];
          const statusField = fields.find((f) => f.key === 'status');
          setStoreRunning(statusField?.value === 'true');
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    loadStoreStatus();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (storeRunning) {
        document.documentElement.style.backgroundColor = 'white';
      } else {
        document.documentElement.style.backgroundColor = 'black';
      }
    }
  }, [loading, storeRunning]);

  if (loading) return <Loader />;

  return (

    <div className="appContainer">
      {storeRunning ? (
        <>
        <div style={{position: 'fixed', width: '100%', top: 0, left: 0, zIndex: 100000000}}>
        <ToastContainer />
        </div>
          <TitleUpdater />
          <div>
            <Header />
            <Outlet />
          </div>
          <Footer />
        </>
      ) : (
        <WebsitePreviewScreen />
      )}
    </div>
  );
}

export default App;