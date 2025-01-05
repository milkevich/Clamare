import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../shared/UI/Loader';
import { fetchSingleMagazinePage } from '../utils/shopify';
import NotFound from './NotFound';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { Fade } from '@mui/material';

const MagazineItem = () => {
    const { magazineId } = useParams();
    const [magazineItem, setMagazineItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 500);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const loadSingleMagazine = async () => {
            try {
                const data = await fetchSingleMagazinePage(magazineId);
                setMagazineItem(data);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        loadSingleMagazine();
    }, [magazineId]);

    if (loading) {
        return <Loader />;
    }

    if (!magazineItem) return (
        <NotFound />
    )

    const titleField = magazineItem.fields.find((f) => f.key === 'title');
    const descriptionField = magazineItem.fields.find((f) => f.key === 'description');
    const heroField = magazineItem.fields.find((f) => f.key === 'chapterHeroImage');

    const imagesField = magazineItem.fields.find((f) => f.key === 'chapter_images');
    const chapterImageEdges = imagesField?.references?.edges || [];
    const imageUrls = chapterImageEdges
        .filter((edge) => edge.node.__typename === 'MediaImage')
        .map((edge) => edge.node.image.url);

    return (
        <Fade in={!loading && magazineId && magazineItem}>
            <div>
            <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 49, backgroundColor: 'var(--main-bg-color)', padding: isSmallScreen ? '0.5rem 0.75rem' : '0.5rem 1.25rem' }}>
                <p onClick={() => {
                    navigate('/pages/magazine')
                }} style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MdKeyboardArrowLeft size={12} />GO BACK</p>
                <span style={{ color: 'var(--sec-color)' }}>({magazineItem.fields.find((f) => f.key === 'date').value.split('-').join('/')})</span>
            </div>
            <div style={{ maxWidth: '900px', margin: 'auto', padding:  isSmallScreen ? '0.75rem' : '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0rem 3rem 0rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', margin: 0, padding: 0 }}>{titleField?.value.toUpperCase()}</h1>
                    <p style={{ margin: 0, fontSize: '12px' }}>{descriptionField?.value}</p>
                </div>
                {imageUrls.length > 0 && (
                    <div>
                        {imageUrls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Chapter image ${index + 1}`}
                                style={{ width: '100%', marginBottom: '1rem' }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
        </Fade>
    );
};

export default MagazineItem;
