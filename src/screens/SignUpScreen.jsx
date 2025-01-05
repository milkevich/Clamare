import React, { useContext, useState } from 'react';
import Input from '../shared/UI/Input';
import Button from '../shared/UI/Button';
import heyThere from '../assets/HeyThere.png';
import { useNavigate } from 'react-router-dom';
import { Fade, Slide } from '@mui/material';
import s from '../shared/SignUpScreen.module.scss';
import { AuthContext } from '../contexts/AuthContext';

const SignUpScreen = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { signUp, authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password, firstName, lastName } = form;
    const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;

    if (!firstName.trim() || !lastName.trim()) {
      setAlertMessage('Please fill in all fields.');
      return false;
    }

    if (!email || !email.match(emailPattern)) {
      setAlertMessage('Please enter a valid email address.');
      return false;
    }

    if (!password || password.length < 6) {
      setAlertMessage('Your password must have at least 6 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(false); 

    if (!validateForm()) {
      setAlert(true);
      setTimeout(() => setAlert(false), 3000);
      return;
    }

    setIsSubmitting(true);
    const { email, password, firstName, lastName } = form;

    try {
      const success = await signUp(email, password, firstName, lastName);

      if (success) {
        navigate('/account');
      } else {
        setAlertMessage(authError || 'Something went wrong. Please try again.');
        setAlert(true);
      }
    } catch (error) {
      setAlertMessage('An unexpected error occurred. Please try again later.');
      setAlert(true);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setAlert(false), 3000);
    }
  };

  return (
    <>
      <Fade timeout={500} in={true}>
        <div className={s.container}>
          <div className={s.contentWrapper}>
            <img className={s.image} src={heyThere} alt="Hey There" />
            <form onSubmit={handleSubmit} className={s.form}>
              <div className={s.nameFields}>
                <Input
                  value={form.firstName}
                  onChange={handleChange}
                  label="FIRST NAME"
                  required
                  outlined={false}
                  name="firstName"
                  type="text"
                />
                <Input
                  value={form.lastName}
                  onChange={handleChange}
                  label="LAST NAME"
                  required
                  outlined={false}
                  name="lastName"
                  type="text"
                />
              </div>
              <Input
                value={form.email}
                onChange={handleChange}
                label="EMAIL"
                name="email"
                type="email"
                required
                outlined={false}
              />
              <Input
                value={form.password}
                onChange={handleChange}
                label="PASSWORD"
                type="password"
                name="password"
                required
                outlined={false}
              />
              <div className={s.buttonContainer}>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'VERIFYING...' : 'SIGN UP'}
                </Button>
              </div>
            </form>
            <div className={s.footer}>
              <p>
                ALREADY HAVE AN ACCOUNT?{' '}
                <span
                  onClick={() => navigate('/account/login')}
                  className={s.link}
                >
                  LOG IN
                </span>
              </p>
              <p>
                OR CONTINUE AS A{' '}
                <span
                  onClick={() => navigate('/clothing/shop')}
                  className={s.link}
                >
                  GUEST
                </span>
              </p>
            </div>
          </div>
        </div>
      </Fade>

      <Slide direction="up" in={alert} mountOnEnter unmountOnExit>
        <div
          className={s.alert}
          role="alert"
        >
          <p className={s.alertMessage}>{alertMessage}</p>
        </div>
      </Slide>
    </>
  );
};

export default SignUpScreen;
