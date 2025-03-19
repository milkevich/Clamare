import React, { useState, useEffect } from 'react';
import s from '../shared/LandingScreen.module.scss';
import { Fade } from '@mui/material';
import { fetchLandingPage } from '../utils/shopify';
import Loader from '../shared/UI/Loader';

const LandingScreen = () => {
  const [heroImage, setHeroImage] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const imageUrl = await fetchLandingPage();
        setHeroImage(imageUrl);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    loadHeroImage();
  }, []);
  

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={s.landingScreen}>
      <meta name="facebook-domain-verification" content="i7ht91j92d8v7kvtpma5zsyaipdgua" />
      {heroImage ? (
        <Fade in={true}>
          <img className={s.landingImage} src={heroImage} alt="Hero" />
        </Fade>
      ) : (
        <p className={s.errorMessage}>No hero image found</p>
      )}
    </div>
  );
};

export default LandingScreen;
