import React, { useEffect, useState } from 'react';
import { Fade } from '@mui/material';
import { fetchStoreStatus } from '../utils/shopify';

const WebsitePreviewScreen = () => {
    const [loading, setLoading] = useState(true);
    const [storeStatus, setStoreStatus] = useState(false);
    const [bgColor, setBgColor] = useState('');
    const [color, setColor] = useState('white');
    const [heroMedia, setHeroMedia] = useState({ type: 'image', url: null });
    const [date, setDate] = useState(undefined);

    // Helper function to determine media type
    const getMediaType = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const videoExtensions = ['mp4', 'webm', 'ogg'];

        if (imageExtensions.includes(extension)) return 'image';
        if (videoExtensions.includes(extension)) return 'video';
        return 'image'; // Default to image if unknown
    };

    useEffect(() => {
        const loadStoreStatus = async () => {
            try {
                const data = await fetchStoreStatus();

                if (data.length > 0) {
                    const fields = data[0];

                    const statusField = fields.find((f) => f.key === 'status');
                    const dateField = fields.find((f) => f.key === 'date');
                    const colorField = fields.find((f) => f.key === 'color');
                    const bgColorField = fields.find((f) => f.key === 'accent_color');
                    const heroField = fields.find((f) => f.key === 'preview_hero');

                    setStoreStatus(statusField?.value === 'true');
                    setDate(dateField?.value);
                    setColor(colorField?.value);
                    setBgColor(bgColorField?.value);

                    if (heroField?.reference?.mediaUrl) {
                        const url = heroField.reference.mediaUrl;
                        const type = getMediaType(url);
                        setHeroMedia({ type, url });
                    }
                }
            } catch (err) {
                console.error('Error fetching store status:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStoreStatus();
    }, []);

    return (
        <div
            style={{
                width: '100vw',
                backgroundColor: storeStatus ? 'white' : 'black',
                color: storeStatus ? 'black' : 'white',
                overflow: 'hidden',
                height: '100vh',
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
                            />
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
                                alt="Hero"
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
            </div>
        </div>
    );
};

export default WebsitePreviewScreen;
