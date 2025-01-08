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
    const [heroFile, setHeroFile] = useState(null);
    const [logo, setLogo] = useState(null);
    const [date, setDate] = useState(undefined);
    const [isHeroVideo, setIsHeroVideo] = useState(false);

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
                    const mixBlendMode = fields.find((f) => f.key === 'mix_blend_mode_diff');
                    const bgColorField = fields.find((f) => f.key === 'accent_color');
                    const logoField = fields.find((f) => f.key === 'logo');
                    const heroField = fields.find((f) => f.key === 'preview_hero');

                    setMixBlendMode(mixBlendMode?.value);
                    setTime(timeField?.value);
                    setColor(colorField?.value);
                    setBgColor(bgColorField?.value);
                    setLogo(logoField?.reference?.image?.url);
                    
                    // Check if heroField is an image or video
                    if (heroField?.reference?.__typename === 'MediaImage') {
                        setHeroFile(heroField.reference.image.url);
                        setIsHeroVideo(false);
                    } else if (heroField?.reference?.__typename === 'Video') {
                        setHeroFile(heroField.reference.sources[0]?.url);
                        setIsHeroVideo(true);
                    }

                    setStoreStatus(statusField?.value === 'true');
                    setDate(dateField?.value);
                }
            } catch (err) {
                console.error(err);
            }
        };

        loadStoreStatus();
    }, []);

    useEffect(() => {
        if (!heroFile && !logo) {
            setLoading(false);
            return;
        }

        const fileUrls = [heroFile, logo].filter(Boolean);
        if (fileUrls.length === 0) {
            setLoading(false);
            return;
        }

        let loadedCount = 0;
        fileUrls.forEach((url) => {
            const media = new Image();
            media.src = url;
            media.onload = () => {
                loadedCount++;
                if (loadedCount === fileUrls.length) {
                    setLoading(false);
                }
            };

            media.onerror = () => {
                loadedCount++;
                if (loadedCount === fileUrls.length) {
                    setLoading(false);
                }
            };
        });
    }, [heroFile, logo]);

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
                {isHeroVideo ? (
                    <video
                        style={{
                            zIndex: 100,
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            opacity: heroFile ? 0.5 : 0,
                        }}
                        src={heroFile || ''}
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
                            opacity: heroFile ? 0.5 : 0,
                        }}
                        src={heroFile || ''}
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
                            alignItems: 'center',
                        }}
                    >
                        {logo && (
                            <img
                                style={{ maxWidth: '100px' }}
                                src={logo}
                                alt="Clamare Logo"
                            />
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
