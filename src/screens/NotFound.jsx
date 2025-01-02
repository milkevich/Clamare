import React from 'react'
import notFoundImg from '../assets/NotFound.png'
import Button from '../shared/UI/Button'
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


const NotFound = () => {
    const navigate = useNavigate()
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 300, backgroundColor: 'var(--main-bg-color)', padding: '20px', fontSize: '12px' }}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90vh'}}>
                <div style={{ textAlign: 'center', maxHeight: '250px', overflow: 'hidden' }}>
                    <img style={{ maxWidth: '600px' }} src={notFoundImg} alt="" />
                    <br />
                    <br />
                    <p>CLAMÁRE:</p>
                    <p>SEEMS LIKE WE'VE WARNED OFF TRAILS, LET'S GET YOU BACK ON TRACK.</p>
                </div>
            </div>
            <div className='btn' onClick={() => {navigate(-1)}} style={{ position: 'fixed', bottom: 0, width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center', left: 0, cursor: 'pointer', padding: '20px', transition: 'ease-in-out 0.3s all' }}>
                <p style={{ display: 'flex', alignItems: 'center' }}><MdKeyboardArrowLeft size={14} /> GO BACK</p>
            </div>
        </div>
    )
}

export default NotFound