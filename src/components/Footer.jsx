import React from 'react'
import s from '../shared/Footer.module.scss'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate()

    const handleNavigate = (path) => {
        navigate(path)
    }

    return (
        <div className={s.footer}>
            <div className={s.footerLinks}>
                <p onClick={() => {handleNavigate('/pages/support/customer-service')}} className={s.footerLink}>SUPPORT</p>
                <p onClick={() => {handleNavigate('/pages/support/customer-service/contact')}} className={s.footerLink}>CONTACT</p>
                <a style={{color: 'var(--main-color)'}} href='https://www.instagram.com/clamare.us/' className={s.footerLink}>INSTAGRAM</a>
            </div>
            <p className={s.footerCopyright}>® Clamáre 2024</p>
        </div>
    )
}

export default Footer
