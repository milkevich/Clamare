import React, { useEffect, useState } from 'react';
import { Fade } from '@mui/material';
import { fetchStoreStatus } from '../utils/shopify';

const WebsitePreviewScreen = () => {
    const [loading, setLoading] = useState(true);
    const [previewData, setPreviewData] = useState([]);
    const [storeStatus, setStoreStatus] = useState(false);
    const [time, setTime] = useState('')
    const [mixBlendMode, setMixBlendMode] = useState(false)
    const [bgColor, setBgColor] = useState('');
    const [color, setColor] = useState('white');
    const [heroImg, setHeroImg] = useState(null);
    const [logo, setLogo] = useState(null);
    const [date, setDate] = useState(undefined);

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
                    
                    setMixBlendMode(mixBlendMode?.value)
                    setTime(timeField?.value)
                    setColor(colorField?.value);
                    setBgColor(bgColorField?.value);
                    setLogo(logoField?.reference?.image?.url);
                    setHeroImg(heroField?.reference?.image?.url);
                    setStoreStatus(statusField?.value === 'true');
                    setDate(dateField?.value);
                }
            } catch (err) {
            }
        };

        loadStoreStatus();
    }, []);

    useEffect(() => {
        if (!heroImg && !logo) {
            setLoading(false);
            return;
        }

        const imageUrls = [heroImg, logo].filter(Boolean);
        if (imageUrls.length === 0) {
            setLoading(false);
            return;
        }

        let loadedCount = 0;
        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === imageUrls.length) {
                    setLoading(false);
                }
            };

            img.onerror = () => {
                loadedCount++;
                if (loadedCount === imageUrls.length) {
                    setLoading(false);
                }
            };
        });
    }, [heroImg, logo]);

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
                        opacity: heroImg ? 0.5 : 0,
                    }}
                    src={heroImg || ''}
                />

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
