import React, { useContext, useState } from 'react';
import Input from '../shared/UI/Input';
import Button from '../shared/UI/Button';
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
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(''); // New state for generated code
  const [enteredCode, setEnteredCode] = useState('');     // New state for user-entered code

  const { signUp, authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVerificationChange = (e) => {
    setEnteredCode(e.target.value);
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

    if (!showVerification) {
      // **Step 1:** Form Submission
      if (!validateForm()) {
        setAlert(true);
        setTimeout(() => setAlert(false), 3000);
        return;
      }

      // Generate the verification code
      const code = generateVerificationCode();
      setGeneratedCode(code);
      console.log(`Generated Verification Code: ${code}`);

      try {
        const response = await fetch('http://localhost:3001/api/verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code,
            firstName: form.firstName,
            email: form.email
          })

        });
        console.log(code, form.email, form.firstName)

        const data = await response.json();

        if (response.ok && data.success) {
          // Successfully sent the verification email
          setShowVerification(true);
          setAlertMessage('A verification code has been sent to your email.');
          setAlert(true);
          setTimeout(() => setAlert(false), 3000);
        } else {
          // Handle errors returned from the backend
          setAlertMessage(data.message || 'Failed to send verification email.');
          setAlert(true);
          setTimeout(() => setAlert(false), 3000);
        }
      } catch (error) {
        console.error('Error sending verification code:', error);
        setAlertMessage('An error occurred while sending the verification code. Please try again.');
        setAlert(true);
        setTimeout(() => setAlert(false), 3000);
      }
    } else {
      // **Step 2:** Code Verification
      if (enteredCode !== generatedCode) {
        setAlertMessage('Invalid verification code. Please try again.');
        setAlert(true);
        setTimeout(() => setAlert(false), 3000);
        return;
      }

      // Proceed with sign-up
      setIsSubmitting(true);
      const { email, password, firstName, lastName, phone } = form;

      try {
        const success = await signUp(email, password, firstName, lastName, phone);
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
        setShowVerification(false); // Reset the verification step
        setEnteredCode('');        // Clear the entered code
        setGeneratedCode('');      // Clear the generated code
        setTimeout(() => setAlert(false), 3000);
      }
    }
  };

  return (
    <>
      <Fade timeout={500} in={true}>
        <div className={s.container}>
          <div className={s.contentWrapper}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '42px', fontWeight: '900', margin: 0 }}>
                {showVerification ? "VERIFY IT'S YOU" : 'SIGN UP'}
              </p>
              <p style={{ fontSize: '12px', fontWeight: '500', margin: 0, marginTop: '0.5rem' }}>
                {showVerification
                  ? "PLEASE GO TO YOUR INBOX, WE'VE SENT YOU A 6-DIGIT CODE FOR VERIFICATION"
                  : 'PLEASE FILL IN YOUR INFORMATION'}
              </p>
            </div>

            {showVerification ? (
              <div style={{ width: 'calc(100% - 2rem)' }}>
                {/* Optional: Display the generated code for testing (Remove in production) */}
                {/* <p style={{ color: 'green', textAlign: 'center' }}>
                  Your verification code is: <strong>{generatedCode}</strong>
                </p> */}

                <Input
                  value={enteredCode}
                  onChange={handleVerificationChange}
                  label='6-DIGIT CODE'
                  name="verificationCode"
                  type="text"
                  maxLength={6}
                  required
                  outlined={false}
                />
                <div className={s.buttonContainer}>
                  <Button onClick={handleSubmit} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'SIGNING UP...' : 'SIGN UP'}
                  </Button>
                </div>
              </div>
            ) : (
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
                <Input
                  value={form.phone}
                  onChange={handleChange}
                  label="PHONE"
                  type="tel"
                  name="phone"
                  outlined={false}
                />
                <div className={s.buttonContainer}>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'VERIFYING...' : 'CONTINUE'}
                  </Button>
                </div>
              </form>
            )}

            <div className={s.footer}>
              <p>
                ALREADY HAVE AN ACCOUNT?{' '}
                <span onClick={() => navigate('/account/login')} className={s.link}>
                  LOG IN
                </span>
              </p>
              <p>
                OR CONTINUE AS A{' '}
                <span onClick={() => navigate('/clothing/shop')} className={s.link}>
                  GUEST
                </span>
              </p>
            </div>
          </div>
        </div>
      </Fade>

      <Slide direction="up" in={alert} mountOnEnter unmountOnExit>
        <div className={s.alert} role="alert">
          <p className={s.alertMessage}>{alertMessage}</p>
        </div>
      </Slide>
    </>
  );
};

export default SignUpScreen;
