// src/components/LogInScreen.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Slide } from '@mui/material';
import Input from '../shared/UI/Input';
import Button from '../shared/UI/Button';
import heyThere from '../assets/HeyThere.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const LogInScreen = () => {
  const { logIn } = useContext(AuthContext); // Use logIn from context
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState([]);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';

  // Debugging: Log form state whenever it changes
  useEffect(() => {
    console.log('Form State:', form);
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`); // Debugging
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    // Basic Client-side Validation
    if (!email || !password) {
      setErrors([{ message: 'Please fill in all fields.' }]);
      setAlert(true);
      setAlertMessage('Please fill in all fields.');
      setTimeout(() => setAlert(false), 3000);
      return;
    }

    setIsSubmitting(true); // Start loading

    const result = await logIn(email, password); // Use logIn from context

    if (result.errors) {
      // Extract and display error messages from Shopify
      const errorMessages = result.errors.map((error, idx) => (
        <p key={idx} style={{ color: 'red' }}>{error.message}</p>
      ));
      setErrors(result.errors);
      setAlert(true);
      setAlertMessage(result.errors[0].message || 'Login failed. Please try again.');
      setTimeout(() => setAlert(false), 3000);
    } else {
      // Successful login is handled by AuthContext
      // Redirect to the intended page after successful login
      navigate(from, { replace: true });
    }

    setIsSubmitting(false); // End loading
  };

  return (
    <>
      <div
        style={{
          maxWidth: '400px',
          margin: 'auto',
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 140px)',
        }}
      >
        <img style={{ maxWidth: '400px' }} src={heyThere} alt="Hey There" />
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            gap: '10px',
            marginTop: '-100px',
          }}
        >
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
          <br />
          <br />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'VERIFYING...' : 'LOG IN'}
          </Button>
        </form>
        <div style={{ fontSize: '12px', fontWeight: '500', textAlign: 'center' }}>
          <p>
            DON'T HAVE AN ACCOUNT?{' '}
            <span
              onClick={() => navigate('/account/sign-up')}
              style={{ fontWeight: '600', cursor: 'pointer' }}
            >
              SIGN UP
            </span>
          </p>
          <p>
            OR CONTINUE AS A{' '}
            <span
              onClick={() => navigate('/clothing/shop')}
              style={{ fontWeight: '600', cursor: 'pointer' }}
            >
              GUEST
            </span>
          </p>
        </div>
      </div>
      <Slide direction="up" in={alert}>
        <div
          style={{
            maxWidth: '370px',
            width: '100%',
            padding: '10px',
            border: '1px solid var(--main-color)',
            zIndex: 10,
            backgroundColor: 'var(--main-bg-color)',
            bottom: 20,
            left: 20,
            position: 'fixed',
          }}
        >
          <p style={{ margin: 0, fontSize: '12px' }}>{alertMessage}</p>
        </div>
      </Slide>
    </>
  );
};

export default LogInScreen;
