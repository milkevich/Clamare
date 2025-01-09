// src/screens/WebsitePreviewScreen.jsx
import React, { useEffect, useState } from 'react';
import { Fade } from '@mui/material';
import { fetchStoreStatus, fetchMediaById } from '../utils/shopify';

const WebsitePreviewScreen = () => {
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const [color, setColor] = useState('white');
  const [heroMedia, setHeroMedia] = useState({ type: null, url: null });
  const [date, setDate] = useState(undefined);

  useEffect(() => {
    const loadStoreStatus = async () => {
      try {
        const data = await fetchStoreStatus();
        console.log('Fetched data:', data); // Debugging

        if (data.length > 0) {
          const fields = data[0];
          console.log('Fields:', fields); // Debugging

          const statusField = fields.find((f) => f.key === 'status');
          const dateField = fields.find((f) => f.key === 'date');
          const colorField = fields.find((f) => f.key === 'color');
          const bgColorField = fields.find((f) => f.key === 'accent_color');
          const heroField = fields.find((f) => f.key === 'preview_hero');

          setStoreStatus(statusField?.value === 'true');
          setDate(dateField?.value);
          setColor(colorField?.value);
          setBgColor(bgColorField?.value);

          if (heroField?.reference) {
            let url = null;
            let type = null;

            // Check if the media is an image
            if (heroField.reference.image && heroField.reference.image.url) {
              url = heroField.reference.image.url;
              type = 'image';
            }
            // Check if the media is a video
            else if (heroField.reference.__typename === 'Video') {
              const gid = heroField.value;
              const videoUrl = await fetchMediaById(gid);
              if (videoUrl) {
                url = videoUrl;
                type = 'video';
              }
            }
            // Optional: Handle other media types if necessary
            else if (heroField.reference.mediaUrl) {
              url = heroField.reference.mediaUrl;
              // Optionally determine type based on extension
              // const type = getMediaType(url);
              type = 'image'; // Defaulting to image
            }

            if (url && type) {
              console.log(`Hero media type: ${type}, URL: ${url}`); // Debugging
              setHeroMedia({ type, url });
            } else {
              console.warn('No valid media found for preview_hero');
            }
          } else {
            console.warn('No preview_hero field found');
          }
        } else {
          console.warn('No data returned from fetchStoreStatus');
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
    if (!heroMedia.url) {
      setLoading(false);
      return;
    }

    if (heroMedia.type === 'image') {
      const img = new Image();
      img.src = heroMedia.url;
      img.onload = () => setLoading(false);
      img.onerror = () => setLoading(false);
    } else if (heroMedia.type === 'video') {
      const video = document.createElement('video');
      video.src = heroMedia.url;
      video.onloadeddata = () => setLoading(false);
      video.onerror = () => setLoading(false);
    }
  }, [heroMedia]);

  return (
    <div
      style={{
        width: '100vw',
        backgroundColor: storeStatus ? 'white' : 'black',
        color: storeStatus ? 'black' : 'white',
        overflow: 'hidden',
        height: '100vh',
        position: 'relative', // Ensure positioning context
      }}
    >
      <div
        style={{
          width: '100%',
          height: '90dvh',
          overflow: 'hidden',
          maxWidth: '600px',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {!loading && heroMedia.url && (
          <>
            {heroMedia.type === 'video' ? (
              <video
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  objectFit: 'cover',
                  opacity: 0.5,
                  filter: 'grayscale(50%)',
                }}
                src={heroMedia.url}
                autoPlay
                loop
                muted
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  objectFit: 'cover',
                  opacity: 0.5,
                  filter: 'grayscale(50%)',
                }}
                src={heroMedia.url}
                alt="Hero Image"
              />
            )}
          </>
        )}

        <Fade timeout={2000} in={!loading}>
          <div
            style={{
              zIndex: 1000,
              textAlign: 'center',
              width: '350px',
              marginTop: '3rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* You can add logo or other content here if needed */}
            <p style={{ fontSize: '12px', fontWeight: '400', color: 'var(--main-bg-color)' }}>
              CLAMÁRE:
            </p>
            <p style={{ fontSize: '12px', fontWeight: '400', marginTop: '0.5rem', color: 'var(--main-bg-color)' }}>
              HEY, WE'RE CURRENTLY PREPARING FOR THE DROP,
              {date ? (
                <>
                  {' '}COME BACK ON{' '}
                  <span style={{ backgroundColor: bgColor, color }}>
                    {date}
                  </span>
                </>
              ) : (
                ' CHECK BACK LATER'
              )}
            </p>
          </div>
        </Fade>

        {/* Optional: Fallback content if media fails to load */}
        {!loading && !heroMedia.url && (
          <div style={{ color: 'red' }}>
            Failed to load preview media. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsitePreviewScreen;
