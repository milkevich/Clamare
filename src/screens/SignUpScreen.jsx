// src/components/Signup.js
import React, { useState } from 'react';
import { signUp } from '../utils/auth';

const SignUpScreen = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName } = form;
    const result = await signUp(email, password, firstName, lastName);
    if (result.errors) {
      setErrors(result.errors);
      setSuccess(null);
    } else {
      setSuccess('Account created successfully!');
      setErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {errors.length > 0 && (
        <div>
          {errors.map((error, idx) => (
            <p key={idx} style={{ color: 'red' }}>{error.message}</p>
          ))}
        </div>
      )}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
      </div>
      <div>
        <label>First Name:</label>
        <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
      </div>
      <div>
        <label>Last Name:</label>
        <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUpScreen;
