import React, { useEffect, useState } from 'react'
import notFoundImg from '../assets/NotFound.png'
import Button from '../shared/UI/Button'
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


const NotFound = () => {
    const navigate = useNavigate()
    const [isSmallScreen, setIsSmallScreen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 900);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 300, backgroundColor: 'var(--main-bg-color)', fontSize: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90vh' }}>
                <div style={{ textAlign: 'center', maxHeight: '250px', overflow: 'hidden' }}>
                    <img style={{ maxWidth: '600px', width: 'calc(100% - 40px)' }} src={notFoundImg} alt="" />
                    <br />
                    <br />
                    <p>CLAMÁRE:</p>
                    <p style={{padding: '0rem 1.25rem'}}>SEEMS LIKE WE'VE WARNED OFF TRAILS, LET'S GET YOU BACK ON TRACK.</p>
                </div>
            </div>
            <div className='btn' onClick={() => { navigate('/products/all') }} style={{ position: 'fixed', bottom: 0, width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center', left: 0, cursor: 'pointer', padding: '20px', transition: 'ease-in-out 0.3s all' }}>
                <p style={{ display: 'flex', alignItems: 'center' }}><MdKeyboardArrowLeft size={14} /> GO BACK</p>
            </div>
        </div>
    )
}

export default NotFound