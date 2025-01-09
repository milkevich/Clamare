import React, { useEffect, useState } from 'react';
import { Fade } from '@mui/material';
import { fetchStoreStatus } from '../utils/shopify';

const WebsitePreviewScreen = () => {
    const [loading, setLoading] = useState(true);
    const [previewData, setPreviewData] = useState([]);
    const [storeStatus, setStoreStatus] = useState(false);
    const [time, setTime] = useState('');
    const [mixBlendMode, setMixBlendMode] = useState(false);
    const [bgColor, setBgColor] = useState('');
    const [color, setColor] = useState('white');
    const [heroMedia, setHeroMedia] = useState({ type: 'image', url: null });
    const [logoMedia, setLogoMedia] = useState({ type: 'image', url: null });
    const [date, setDate] = useState(undefined);

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
                setPreviewData(data);

                if (data.length > 0) {
                    const fields = data[0];

                    const statusField = fields.find((f) => f.key === 'status');
                    const dateField = fields.find((f) => f.key === 'date');
                    const colorField = fields.find((f) => f.key === 'color');
                    const timeField = fields.find((f) => f.key === 'time');
                    const mixBlendModeField = fields.find((f) => f.key === 'mix_blend_mode_diff');
                    const bgColorField = fields.find((f) => f.key === 'accent_color');
                    const logoField = fields.find((f) => f.key === 'logo');
                    const heroField = fields.find((f) => f.key === 'preview_hero');

                    setMixBlendMode(mixBlendModeField?.value);
                    setTime(timeField?.value);
                    setColor(colorField?.value);
                    setBgColor(bgColorField?.value);
                    setStoreStatus(statusField?.value === 'true');
                    setDate(dateField?.value);

                    // Determine media type for hero
                    const heroUrl = heroField?.reference?.image?.url || heroField?.reference?.mediaUrl;
                    const heroType = heroUrl ? getMediaType(heroUrl) : 'image';
                    setHeroMedia({ type: heroType, url: heroUrl });

                    // Determine media type for logo
                    const logoUrl = logoField?.reference?.image?.url || logoField?.reference?.mediaUrl;
                    const logoType = logoUrl ? getMediaType(logoUrl) : 'image';
                    setLogoMedia({ type: logoType, url: logoUrl });
                }
            } catch (err) {
                console.error(err);
            }
        };

        loadStoreStatus();
    }, []);

    useEffect(() => {
        if ((!heroMedia.url && !logoMedia.url)) {
            setLoading(false);
            return;
        }

        const mediaUrls = [heroMedia.url, logoMedia.url].filter(Boolean);
        if (mediaUrls.length === 0) {
            setLoading(false);
            return;
        }

        let loadedCount = 0;
        mediaUrls.forEach((url) => {
            const extension = url.split('.').pop().toLowerCase();
            const videoExtensions = ['mp4', 'webm', 'ogg'];

            if (videoExtensions.includes(extension)) {
                const video = document.createElement('video');
                video.src = url;
                video.onloadeddata = () => {
                    loadedCount++;
                    if (loadedCount === mediaUrls.length) {
                        setLoading(false);
                    }
                };
                video.onerror = () => {
                    loadedCount++;
                    if (loadedCount === mediaUrls.length) {
                        setLoading(false);
                    }
                };
            } else {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === mediaUrls.length) {
                        setLoading(false);
                    }
                };
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === mediaUrls.length) {
                        setLoading(false);
                    }
                };
            }
        });
    }, [heroMedia, logoMedia]);

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
                    flexDirection: 'column'
                }}
            >
                {heroMedia.type === 'video' ? (
                    <video
                        style={{
                            zIndex: 100,
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
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
                            zIndex: 100,
                            objectFit: 'cover',
                            filter: 'grayscale(50%)',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            opacity: heroMedia.url ? 0.5 : 0,
                        }}
                        src={heroMedia.url || ''}
                        alt="Hero"
                    />
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
                            alignItems: 'center'
                        }}
                    >
                        {logoMedia.type === 'video' ? (
                            <video
                                style={{ maxWidth: '100px' }}
                                src={logoMedia.url}
                                autoPlay
                                loop
                                muted
                            />
                        ) : (
                            logoMedia.url && (
                                <img
                                    style={{ maxWidth: '100px' }}
                                    src={logoMedia.url}
                                    alt="Clamare Logo"
                                />
                            )
                        )}
                        <div>
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
                    </div>
                </Fade>
            </div>
        </div>
    );
};

export default WebsitePreviewScreen;
