import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import TitleUpdater from './components/TitleUpdater';
import WebsitePreviewScreen from './screens/WebsitePreviewScreen';
import { fetchStoreStatus } from './utils/shopify';
import './shared/Variables.scss'; 
import Loader from './shared/UI/Loader';

function App() {
  const [storeRunning, setStoreRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoreStatus = async () => {
      try {
        const data = await fetchStoreStatus();
        console.log('Fetched store status data:', data);
  
        if (data.length > 0) {
          const fields = data[0];
          const statusField = fields.find((f) => f.key === 'status');
          setStoreRunning(statusField?.value === 'true');
        }
      } catch (err) {
        console.error('Error fetching store status:', err);
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

  if (loading) return <Loader/>; 

  return (
    <div className="appContainer">
      {storeRunning ? (
        <>
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
