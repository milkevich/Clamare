import React from 'react'
import s from '../shared/LandingScreen.module.scss'
import { Fade } from '@mui/material'

const LandingScreen = () => {
  return (
    <div className={s.landingScreen}>
      <Fade in={true}>
        <img className={s.landingImage} src="" alt="" />
      </Fade>
    </div>
  )
}

export default LandingScreen
