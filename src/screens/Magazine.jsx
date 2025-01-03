// Magazine.jsx
import React, { useEffect, useState } from 'react';
import { fetchMagazinePages } from '../utils/shopify';
import Loader from '../shared/UI/Loader';
import { Fade } from '@mui/material';

const Magazine = () => {
    const [magazineChapters, setMagazineChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [isSmallScreen2, setIsSmallScreen2] = useState(false)
    const [isSmallScreen3, setIsSmallScreen3] = useState(false)
    const [isSmallScreen4, setIsSmallScreen4] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 1000);
            setIsSmallScreen2(window.innerWidth <= 700);
            setIsSmallScreen4(window.innerWidth <= 500);
            setIsSmallScreen3(window.innerWidth <= 400);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const loadMagazineData = async () => {
            try {
                const data = await fetchMagazinePages();
                setMagazineChapters(data);
                console.log('Chapters:', data);
            } catch (err) {
                console.error('Error fetching magazine chapters:', err);
            } finally {
                setLoading(false);
            }
        };
        loadMagazineData();
    }, []);

    if (loading) return <Loader />;

    return (
        <Fade in={!loading}>
        <ul
            style={{
                maxWidth: '1470px',
                margin: 'auto',
                listStyle: 'none',
                display: 'grid',
                gridTemplateColumns: isSmallScreen3 ? 'repeat(1, 1fr)' : isSmallScreen2 ? 'repeat(2, 1fr)' : isSmallScreen ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
                gap: isSmallScreen4 ? '0.75rem' : '1.25rem',
                padding: isSmallScreen4 ? '0.75rem' : '1.25rem'
            }}
        >
            {magazineChapters.map((chapter) => {
                const heroField = chapter.fields.find((f) => f.key === 'chapterHeroImage' || f.key === 'chapter_hero_image');
                const heroImageUrl = heroField?.reference?.image?.url ?? '';
                const titleField = chapter.fields.find((f) => f.key === 'title');
                const dateField = chapter.fields.find((f) => f.key === 'date');
                const descriptionField = chapter.fields.find((f) => f.key === 'description');

                return (
                    <li key={chapter.id} style={{}}>
                        <img
                            style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/2' }}
                            src={heroImageUrl}
                            alt="Chapter Hero"
                        />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{titleField?.value.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '580' }}>{descriptionField?.value}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>{dateField?.value && dateField.value.split('-').join('/')}</p>
                    </li>
                );
            })}
            {magazineChapters.map((chapter) => {
                const heroField = chapter.fields.find((f) => f.key === 'chapterHeroImage' || f.key === 'chapter_hero_image');
                const heroImageUrl = heroField?.reference?.image?.url ?? '';
                const titleField = chapter.fields.find((f) => f.key === 'title');
                const dateField = chapter.fields.find((f) => f.key === 'date');
                const descriptionField = chapter.fields.find((f) => f.key === 'description');

                return (
                    <li key={chapter.id} style={{}}>
                        <img
                            style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/2' }}
                            src={heroImageUrl}
                            alt="Chapter Hero"
                        />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{titleField?.value.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '580' }}>{descriptionField?.value}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>{dateField?.value && dateField.value.split('-').join('/')}</p>
                    </li>
                );
            })}
            {magazineChapters.map((chapter) => {
                const heroField = chapter.fields.find((f) => f.key === 'chapterHeroImage' || f.key === 'chapter_hero_image');
                const heroImageUrl = heroField?.reference?.image?.url ?? '';
                const titleField = chapter.fields.find((f) => f.key === 'title');
                const dateField = chapter.fields.find((f) => f.key === 'date');
                const descriptionField = chapter.fields.find((f) => f.key === 'description');

                return (
                    <li key={chapter.id} style={{}}>
                        <img
                            style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/2' }}
                            src={heroImageUrl}
                            alt="Chapter Hero"
                        />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{titleField?.value.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '580' }}>{descriptionField?.value}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>{dateField?.value && dateField.value.split('-').join('/')}</p>
                    </li>
                );
            })}
            {magazineChapters.map((chapter) => {
                const heroField = chapter.fields.find((f) => f.key === 'chapterHeroImage' || f.key === 'chapter_hero_image');
                const heroImageUrl = heroField?.reference?.image?.url ?? '';
                const titleField = chapter.fields.find((f) => f.key === 'title');
                const dateField = chapter.fields.find((f) => f.key === 'date');
                const descriptionField = chapter.fields.find((f) => f.key === 'description');

                return (
                    <li key={chapter.id} style={{}}>
                        <img
                            style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/2' }}
                            src={heroImageUrl}
                            alt="Chapter Hero"
                        />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{titleField?.value.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '580' }}>{descriptionField?.value}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>{dateField?.value && dateField.value.split('-').join('/')}</p>
                    </li>
                );
            })}
            {magazineChapters.map((chapter) => {
                const heroField = chapter.fields.find((f) => f.key === 'chapterHeroImage' || f.key === 'chapter_hero_image');
                const heroImageUrl = heroField?.reference?.image?.url ?? '';
                const titleField = chapter.fields.find((f) => f.key === 'title');
                const dateField = chapter.fields.find((f) => f.key === 'date');
                const descriptionField = chapter.fields.find((f) => f.key === 'description');

                return (
                    <li key={chapter.id} style={{}}>
                        <img
                            style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/2' }}
                            src={heroImageUrl}
                            alt="Chapter Hero"
                        />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{titleField?.value.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '580' }}>{descriptionField?.value}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>{dateField?.value && dateField.value.split('-').join('/')}</p>
                    </li>
                );
            })}
            {magazineChapters.map((chapter) => {
                const heroField = chapter.fields.find((f) => f.key === 'chapterHeroImage' || f.key === 'chapter_hero_image');
                const heroImageUrl = heroField?.reference?.image?.url ?? '';
                const titleField = chapter.fields.find((f) => f.key === 'title');
                const dateField = chapter.fields.find((f) => f.key === 'date');
                const descriptionField = chapter.fields.find((f) => f.key === 'description');

                return (
                    <li key={chapter.id} style={{}}>
                        <img
                            style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/2' }}
                            src={heroImageUrl}
                            alt="Chapter Hero"
                        />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{titleField?.value.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '580' }}>{descriptionField?.value}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>{dateField?.value && dateField.value.split('-').join('/')}</p>
                    </li>
                );
            })}
            {magazineChapters.map((chapter) => {
                const heroField = chapter.fields.find((f) => f.key === 'chapterHeroImage' || f.key === 'chapter_hero_image');
                const heroImageUrl = heroField?.reference?.image?.url ?? '';
                const titleField = chapter.fields.find((f) => f.key === 'title');
                const dateField = chapter.fields.find((f) => f.key === 'date');
                const descriptionField = chapter.fields.find((f) => f.key === 'description');

                return (
                    <li key={chapter.id} style={{}}>
                        <img
                            style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/2' }}
                            src={heroImageUrl}
                            alt="Chapter Hero"
                        />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{titleField?.value.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '580' }}>{descriptionField?.value}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>{dateField?.value && dateField.value.split('-').join('/')}</p>
                    </li>
                );
            })}
            {magazineChapters.map((chapter) => {
                const heroField = chapter.fields.find((f) => f.key === 'chapterHeroImage' || f.key === 'chapter_hero_image');
                const heroImageUrl = heroField?.reference?.image?.url ?? '';
                const titleField = chapter.fields.find((f) => f.key === 'title');
                const dateField = chapter.fields.find((f) => f.key === 'date');
                const descriptionField = chapter.fields.find((f) => f.key === 'description');

                return (
                    <li key={chapter.id} style={{}}>
                        <img
                            style={{ width: '100%', maxWidth: '400px', aspectRatio: '3/2' }}
                            src={heroImageUrl}
                            alt="Chapter Hero"
                        />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{titleField?.value.toUpperCase()}</p>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: '580' }}>{descriptionField?.value}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>{dateField?.value && dateField.value.split('-').join('/')}</p>
                    </li>
                );
            })}
        </ul>
        </Fade>
    );
};

export default Magazine;
