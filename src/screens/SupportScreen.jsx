import React, { useState, useRef, useEffect } from 'react';
import { MdArrowDropDown, MdArrowDropUp, MdKeyboardArrowLeft, MdOutlineArrowOutward } from 'react-icons/md';
import Input from '../shared/UI/Input'
import Button from '../shared/UI/Button';
import { Fade, MenuItem, TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const questions = [
  {
    question: "Can I make modifications to my order after it’s been placed?",
    answer: "Once an order is confirmed, we’re unable to make any changes or edits.",
  },
  {
    question: "I used the wrong address. Can I update it?",
    answer: "You can reach out to us ASAP, but address changes aren’t guaranteed. Please double-check everything before placing your order.",
  },
  {
    question: "How can I cancel my order?",
    answer: "Send us your order number and email to request cancellation. Cancellations aren’t guaranteed and may be denied during peak periods. Abuse of cancellations may lead to restrictions.",
  },
  {
    question: "How do I know my order is confirmed?",
    answer: "You’ll get a confirmation email once your order is reviewed and accepted. Don’t forget to check your spam folder too.",
  },
  {
    question: "When will I get my order?",
    answer: "We process orders Monday to Friday and ship within 3–7 business days. Once shipped, you'll get a tracking email. Tracking updates can take 48–72 hours.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes. International orders may have customs fees or taxes. These aren’t refundable and are paid at checkout when available.",
  },
  {
    question: "My tracking says delivered but I don’t have my package?",
    answer: "Wait 48 hours after it says delivered. If it's still missing, contact us at support@clamare.store.",
  },
  {
    question: "Why was my order canceled?",
    answer: "Orders may be canceled due to payment issues or limited stock. Please make sure your payment info is up to date.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major cards (Visa, MasterCard, AmEx, etc.), PayPal, Apple Pay, Google Pay, and more depending on your region.",
  },
  {
    question: "How do I know if something will fit?",
    answer: "Check out our size guide. Each product page also has fit notes and model reference. Still unsure? Hit us up at support@clamare.store.",
  },
  {
    question: "How do I find out when new drops happen?",
    answer: "Subscribe to our newsletter and follow us on Instagram for drop announcements.",
  },
  {
    question: "When will support reply?",
    answer: "We typically respond within 24–48 hours.",
  },
  {
    question: "I placed multiple orders — can you combine them?",
    answer: "We can’t combine separate orders. Each one is processed individually.",
  },
  {
    question: "I got a damaged item. Help?",
    answer: "Email support@clamare.store within 48 hours with pictures of the product and packaging slip.",
  },
  {
    question: "Can I return my online order in person?",
    answer: "No. All returns must be done online. We don’t accept in-person returns at this time.",
  },
  {
    question: "My tracking number isn’t updating.",
    answer: "Tracking numbers are created when the label is made. Allow 1–3 business days for updates.",
  },
  {
    question: "Sold out items — will they restock?",
    answer: "If it’s not on our site, it’s likely gone. Some products may let you sign up for restock alerts.",
  },
  {
    question: "Do you offer gift cards?",
    answer: "Not at the moment, but we’re working on it.",
  },
  {
    question: "Can I get free stickers?",
    answer: "We include stickers in some orders while supplies last, but they’re not guaranteed.",
  },
];


const reasons = [
    { value: 'Cancellation', label: 'CANCEL REQUEST' },
    { value: 'Status update', label: 'ORDER STATUS' },
    { value: 'Adress update', label: 'ADRESS UPDATE REQUEST' },
    { value: 'Shipment', label: 'SHIPPING' },
    { value: 'Tracking', label: 'TRACKING' },
    { value: 'Reporting an issue', label: 'REPORT AN ISSUE' },
    { value: 'Other', label: 'OTHER' },
];


const SupportScreen = () => {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [height, setHeight] = useState({});
    const answerRefs = useRef([]);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isSmallScreen2, setIsSmallScreen2] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [messageSent, setMessageSent] = useState(false)
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
        reason: '',
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.firstName.trim() ||
            !form.lastName.trim() ||
            !form.email.trim() ||
            !form.message.trim() ||
            !form.reason.trim()
        ) {
            toast.error('All fields are required.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(form.email)) {
            toast.error('Invalid email format.');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/api/contact', form);
            setForm({
                firstName: '',
                lastName: '',
                email: '',
                message: '',
                reason: '',
            });
            setMessageSent(true);
            toast.success('Your message has been sent successfully!');
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.message || 'Failed to send your message.');
            } else if (error.request) {
                toast.error('No response from server. Please try again later.');
            } else {
                toast.error('An unexpected error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    const [selectedSection, setSelectedSection] = useState('');

    const contactRef = useRef(null);
    const faqRef = useRef(null);
    const legalRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.toLowerCase();
        if (path.includes('/pages/support/customer-service/contact')) {
            setSelectedSection('Contact');
        } else if (path.includes('/pages/support/customer-service/faq')) {
            setSelectedSection('FAQ');
        } else if (path.includes('/pages/support/customer-service/legal')) {
            setSelectedSection('Legal');
        } else {
            setSelectedSection('Contact');
        }
    }, [location.pathname]);

    useEffect(() => {
        if (selectedSection === 'Contact' && contactRef.current) {
            contactRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (selectedSection === 'FAQ' && faqRef.current) {
            faqRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (selectedSection === 'Legal' && legalRef.current) {
            legalRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedSection]);

    const handleSectionClick = (section) => {
        setSelectedSection(section);

        switch (section) {
            case 'Contact':
                navigate('/pages/support/customer-service/contact');
                break;
            case 'FAQ':
                navigate('/pages/support/customer-service/faq');
                break;
            case 'Legal':
                navigate('/pages/support/customer-service/legal');
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 800);
            setIsSmallScreen2(window.innerWidth <= 500);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleExpand = (index) => {
        setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
    };
    useEffect(() => {
        answerRefs.current.forEach((ref, index) => {
            if (ref) {
                setHeight((prevHeight) => ({
                    ...prevHeight,
                    [index]: expandedIndex === index ? ref.scrollHeight : 0,
                }));
            }
        });
    }, [expandedIndex]);

    return (
        <Fade in={true}>
            <div ref={contactRef}>
                <div style={{ display: 'flex', gap: '1.75rem', padding: isSmallScreen2 ? '0.5rem 0.75rem' : '0.5rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--main-bg-color)', position: 'sticky', top: 49, zIndex: 60 }}>
                    <div style={{ maxWidth: '1300px', margin: 'auto', display: 'flex', gap: '1.75rem', width: '100%', justifyContent: 'space-between' }}>
                        <p onClick={() => {
                            navigate(-1)
                        }} style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '10px' }}><MdKeyboardArrowLeft size={12} />GO BACK</p>
                        <div style={{ display: 'flex', gap: '1.75rem' }}>
                            <p
                                onClick={() => handleSectionClick('Contact')}
                                style={{
                                    fontSize: '10px',
                                    fontWeight: selectedSection === 'Contact' ? '600' : '500',
                                    margin: 0,
                                    textDecoration: selectedSection === 'Contact' ? 'underline' : 'none',
                                    cursor: 'pointer',
                                    display: isSmallScreen ? '' : 'none'
                                }}
                            >
                                CONTACT US
                            </p>
                            <p
                                onClick={() => handleSectionClick('FAQ')}
                                style={{
                                    fontSize: '10px',
                                    fontWeight: selectedSection === 'FAQ' ? '600' : '500',
                                    margin: 0,
                                    textDecoration: selectedSection === 'FAQ' ? 'underline' : 'none',
                                    cursor: 'pointer',
                                    display: isSmallScreen ? '' : 'none'
                                }}
                            >
                                FAQ
                            </p>
                            <p
                                onClick={() => handleSectionClick('Legal')}
                                style={{
                                    fontSize: '10px',
                                    fontWeight: selectedSection === 'Legal' ? '600' : '500',
                                    margin: 0,
                                    textDecoration: selectedSection === 'Legal' ? 'underline' : 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                LEGAL
                            </p>
                        </div>
                    </div>
                </div>
                {selectedSection !== 'Legal' && isSmallScreen &&
                    <div style={{ height: '3rem', marginTop: '-1.5rem' }}>

                    </div>
                }
                {selectedSection === 'Contact' &&
                    <div style={{
                        margin: 'auto',
                        display: isSmallScreen ? 'block' : 'flex',
                        gap: '3rem',
                        padding: isSmallScreen2 ? '0.75rem' : '1.25rem',
                        justifyContent: 'space-between',
                        maxWidth: isSmallScreen ? '600px' : '1300px'
                    }}
                    >
                        <div style={{
                            height: '100%',
                            width: '100%',
                            maxWidth: isSmallScreen ? '' : '600px',
                        }}>
                            <p style={{ fontSize: isSmallScreen ? '32px' : '24px', fontWeight: '900', paddingBottom: isSmallScreen && '3rem', margin: isSmallScreen && 0, paddingTop: '1rem' }}>CONTACT US</p>
                            <div>
                                <div style={{ padding: '0px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <Input name='firstName' value={form.firstName} onChange={handleInputChange} label="FIRST NAME" outlined={false} />
                                        <Input name='lastName' value={form.lastName} onChange={handleInputChange} label="LAST NAME" outlined={false} />
                                    </div>
                                    <Input name='email' value={form.email} onChange={handleInputChange} label="EMAIL" outlined={false} />
                                    <TextField
                                        select
                                        label="REASON"
                                        name='reason'
                                        value={form.reason}
                                        onChange={handleInputChange}
                                        variant="standard"
                                        fullWidth
                                        sx={{
                                            '& .MuiInput-root:before': {
                                                borderBottom: '1px solid var(--border-color) !important',
                                            },
                                            '& .MuiInput-root:hover:before': {
                                                borderBottom: '1px solid lightgrey !important',
                                            },
                                            '& .MuiInput-root:after': {
                                                borderBottom: '1px solid var(--main-color) !important',
                                            },

                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'transparent !important',
                                            },

                                            '& .MuiSelect-select': {
                                                fontSize: '12px !important',
                                            },

                                            '& .MuiInputBase-input': {
                                                fontSize: '12px !important',
                                            },
                                            // Label styling
                                            '& .MuiInputLabel-root': {
                                                color: 'var(--main-color)',
                                                fontSize: '12px',
                                                transition: 'ease-in-out 0.2s all',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'var(--main-color)',
                                                fontSize: '12px',
                                            },
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backgroundColor: 'var(--main-color)',
                                                    color: 'var(--main-color)',
                                                    border: '1px solid var(--border-color)',
                                                    '& .MuiMenuItem-root': {
                                                        fontSize: '10px',
                                                        padding: '10px',
                                                        '&:hover': {
                                                            backgroundColor: 'var(--main-color) !important',
                                                            color: 'var(--main-color) !important',
                                                            textDecoration: '',
                                                        },
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {reasons.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        id="standard-multiline-static"
                                        label="MESSAGE"
                                        multiline
                                        rows={4}
                                        placeholder="Type your message here"
                                        fullWidth
                                        value={form.message}
                                        name='message'
                                        onChange={handleInputChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 0,
                                                padding: '15px',
                                                fontSize: '12px',
                                                boxSizing: 'border-box',
                                                '& fieldset': {
                                                    borderColor: 'var(--border-color)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'lightgrey',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--main-color)',
                                                    borderWidth: '1px',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'var(--main-color)',
                                                fontSize: '12px',
                                                transition: 'ease-in-out 0.2s all',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'var(--main-color)',
                                                fontSize: '12px',
                                            },
                                            '& .MuiInputLabel-shrink': {
                                                marginTop: '5px',
                                            },
                                            '& input:-webkit-autofill': {
                                                WebkitBoxShadow: '0 0 0 100px var(--sec-bg-color) inset',
                                                WebkitTextFillColor: 'var(--main-color)',
                                                transition: 'background-color 5000s ease-in-out 0s',
                                            },
                                        }}
                                    />
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--sec-color)' }}>Please include all the information regarding your concern.</p>
                                    <p style={{ fontSize: '10px', margin: 0, marginTop: '-10px' }}>OR REACH OUT TO US AT <a style={{fontWeight: '600', textDecoration: 'none', color: 'var(--main-color)'}} href="mailto:support@clamare.store">SUPPORT@CLAMARE.STORE</a></p>
                                    <Button disabled={isSubmitting ? isSubmitting : messageSent} onClick={handleSubmit}>{isSubmitting ? 'SENDING OVER...' : messageSent ? 'MESSAGE SENT!' : 'SEND A MESSAGE'}</Button>
                                    {isSmallScreen && <div style={{ height: '5rem' }} ref={faqRef}></div>}
                                </div>
                            </div>
                        </div>
                        <div

                            style={{
                                height: '100%',
                                width: '100%',
                                maxWidth: isSmallScreen ? '' : '500px',
                            }}>
                            <p style={{ fontSize: isSmallScreen ? '32px' : '24px', fontWeight: '900', paddingBottom: isSmallScreen && '3rem', margin: isSmallScreen && 0, paddingTop: '1rem' }}>FREQUENTLY ASKED QUESTIONS</p>
                            <div style={{ overflowY: 'auto' }}>
                                <div style={{ marginTop: '-1px' }}>
                                    {questions.map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '20px 0px',
                                                borderTop: '1px solid var(--border-color)',
                                                fontSize: '12px',
                                                fontWeight: '580',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => toggleExpand(index)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ margin: 0, width: 'calc(100% - 20px)' }}>{item.question}</p>
                                                {expandedIndex === index ? <MdArrowDropUp size={18} /> : <MdArrowDropDown size={18} />}
                                            </div>
                                            <div
                                                ref={(el) => (answerRefs.current[index] = el)}
                                                style={{
                                                    overflow: 'hidden',
                                                    transition: 'height 0.3s ease-in-out',
                                                    height: height[index] || 0,
                                                }}
                                            >
                                                <p style={{ marginTop: '10px', fontWeight: '400', color: 'var(--sec-color)' }}>{item.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {selectedSection === 'FAQ' &&
                    <div style={{
                        margin: 'auto',
                        display: isSmallScreen ? 'block' : 'flex',
                        gap: '3rem',
                        padding: isSmallScreen2 ? '0.75rem' : '1.25rem',
                        justifyContent: 'space-between',
                        maxWidth: isSmallScreen ? '600px' : '1300px'
                    }}>
                        <div style={{
                            height: '100%',
                            width: '100%',
                            maxWidth: isSmallScreen ? '' : '600px',
                        }}>
                            <p style={{ fontSize: isSmallScreen ? '32px' : '24px', fontWeight: '900', paddingBottom: isSmallScreen && '3rem', margin: isSmallScreen && 0, paddingTop: '1rem' }}>CONTACT US</p>
                            <div>
                                <div style={{ padding: '0px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <Input name='firstName' value={form.firstName} onChange={handleInputChange} label="FIRST NAME" outlined={false} />
                                        <Input name='lastName' value={form.lastName} onChange={handleInputChange} label="LAST NAME" outlined={false} />
                                    </div>
                                    <Input onChange={handleInputChange} value={form.email} name='email' label="EMAIL" outlined={false} />
                                    <TextField
                                        select
                                        label="REASON"
                                        value={form.reason}
                                        onChange={handleInputChange}
                                        variant="standard"
                                        fullWidth
                                        name='reason'
                                        sx={{
                                            '& .MuiInput-root:before': {
                                                borderBottom: '1px solid var(--border-color) !important',
                                            },
                                            '& .MuiInput-root:hover:before': {
                                                borderBottom: '1px solid lightgrey !important',
                                            },
                                            '& .MuiInput-root:after': {
                                                borderBottom: '1px solid var(--main-color) !important',
                                            },

                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'transparent !important',
                                            },

                                            '& .MuiSelect-select': {
                                                fontSize: '12px !important',
                                            },

                                            '& .MuiInputBase-input': {
                                                fontSize: '12px !important',
                                            },
                                            // Label styling
                                            '& .MuiInputLabel-root': {
                                                color: 'var(--main-color)',
                                                fontSize: '12px',
                                                transition: 'ease-in-out 0.2s all',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'var(--main-color)',
                                                fontSize: '12px',
                                            },
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backgroundColor: 'var(--main-color)',
                                                    color: 'var(--main-color)',
                                                    border: '1px solid var(--border-color)',
                                                    '& .MuiMenuItem-root': {
                                                        fontSize: '10px',
                                                        padding: '10px',
                                                        '&:hover': {
                                                            backgroundColor: 'var(--main-color) !important',
                                                            color: 'var(--main-color) !important',
                                                            textDecoration: '',
                                                        },
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {reasons.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        id="standard-multiline-static"
                                        value={form.message}
                                        onChange={handleInputChange}
                                        label="MESSAGE"
                                        multiline
                                        rows={4}
                                        name='message'
                                        placeholder="Type your message here"
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 0,
                                                padding: '15px',
                                                fontSize: '12px',
                                                boxSizing: 'border-box',
                                                '& fieldset': {
                                                    borderColor: 'var(--border-color)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'lightgrey',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--main-color)',
                                                    borderWidth: '1px',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'var(--main-color)',
                                                fontSize: '12px',
                                                transition: 'ease-in-out 0.2s all',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: 'var(--main-color)',
                                                fontSize: '12px',
                                            },
                                            '& .MuiInputLabel-shrink': {
                                                marginTop: '5px',
                                            },
                                            '& input:-webkit-autofill': {
                                                WebkitBoxShadow: '0 0 0 100px var(--sec-bg-color) inset',
                                                WebkitTextFillColor: 'var(--main-color)',
                                                transition: 'background-color 5000s ease-in-out 0s',
                                            },
                                        }}
                                    />
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--sec-color)' }}>Please include all the information regarding your concern.</p>
                                    <p style={{ fontSize: '10px', margin: 0, marginTop: '-10px' }}>OR REACH OUT TO US AT <a style={{fontWeight: '600', textDecoration: 'none', color: 'var(--main-color)'}} href="mailto:support@clamare.store">SUPPORT@CLAMARE.STORE</a></p>
                                    <Button disabled={isSubmitting || messageSent} onClick={handleSubmit}>{isSubmitting ? 'SENDING OVER...' : messageSent ? 'MESSAGE SENT!' : 'SEND A MESSAGE'}</Button>
                                    {isSmallScreen && <div style={{ height: '5rem' }} ref={faqRef}></div>}
                                </div>
                            </div>
                        </div>
                        <div

                            style={{
                                height: '100%',
                                width: '100%',
                                maxWidth: isSmallScreen ? '' : '500px',
                            }}>
                            <p style={{ fontSize: isSmallScreen ? '32px' : '24px', fontWeight: '900', paddingBottom: isSmallScreen && '3rem', margin: isSmallScreen && 0, paddingTop: '1rem' }}>FREQUENTLY ASKED QUESTIONS</p>
                            <div style={{ overflowY: 'auto' }}>
                                <div style={{ marginTop: '-1px' }}>
                                    {questions.map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '20px 0px',
                                                borderTop: '1px solid var(--border-color)',
                                                fontSize: '12px',
                                                fontWeight: '580',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => toggleExpand(index)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ margin: 0, width: 'calc(100% - 20px)' }}>{item.question}</p>
                                                {expandedIndex === index ? <MdArrowDropUp size={18} /> : <MdArrowDropDown size={18} />}
                                            </div>
                                            <div
                                                ref={(el) => (answerRefs.current[index] = el)}
                                                style={{
                                                    overflow: 'hidden',
                                                    transition: 'height 0.3s ease-in-out',
                                                    height: height[index] || 0,
                                                }}
                                            >
                                                <p style={{ marginTop: '10px', fontWeight: '400', color: 'var(--sec-color)' }}>{item.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {selectedSection === 'Legal' && (
                    <div style={{ maxWidth: '1300px', margin: 'auto', padding: isSmallScreen2 ? '0.75rem' : '1.25rem' }}>
                        <div ref={legalRef} style={{ height: '3rem', display: !isSmallScreen && 'none' }}></div>
                        <div style={{ maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <p style={{ fontSize: isSmallScreen ? '32px' : '24px', margin: 0, padding: '2rem 0rem 1.5rem 0rem', fontWeight: '900' }}>TERMS OF USE</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>GENERAL INFORMATION</p>
                                <p style={{ margin: 0 }}>
                                    Clamáre is a clothing brand founded in 2024.
                                    By accessing or using Clamáre's website, you agree to comply with these Terms of Use, including our Privacy Policy. If you do not agree, you should stop using the site immediately.
                                    We reserve the right to update these terms at any time without notice. Continued use of the website constitutes acceptance of any changes.
                                    Clamáre is not responsible for notifying you of updates, so we encourage regular review of these terms.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>ELIGIBILITY</p>
                                <p style={{ margin: 0 }}>
                                    Our website and services are intended for individuals who are 18 years of age or older, or the age of majority in your jurisdiction.
                                    By placing an order, you confirm that you meet these eligibility requirements. If you are underage, you must have parental or guardian consent to use this site.
                                    Clamáre is not liable for any unauthorized use by minors.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>PRODUCTS AND AVAILABILITY</p>
                                <p style={{ margin: 0 }}>
                                    While we strive to keep our inventory updated, product availability may change without notice.
                                    Clamáre does not guarantee that items will always be in stock, and we reserve the right to limit quantities or discontinue products at any time.
                                    Colors, sizes, and designs may appear differently depending on your screen settings, and we cannot ensure that your device displays them accurately.
                                    Clamáre is not responsible for errors in product descriptions or pricing.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>PRICING AND PAYMENTS</p>
                                <p style={{ margin: 0 }}>
                                    All prices are listed in USD unless otherwise stated. We reserve the right to correct any pricing errors or inaccuracies and adjust prices without prior notice.
                                    Payments are securely processed through Shopify, and Clamáre does not store or handle your payment information.
                                    Any issues with payment processing should be directed to your payment provider.
                                    Clamáre is not liable for declined transactions, bank errors, or other payment-related issues.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>SHIPPING POLICY</p>
                                <p style={{ margin: 0 }}>
                                    We ship to select countries, including most of Europe, the U.S., Canada, and Australia. Shipping times are estimates and may vary due to unforeseen circumstances such as courier delays or customs processing.
                                    Clamáre is not responsible for delays or losses caused by third-party couriers.
                                    Once the package leaves our facility, liability for its delivery lies with the courier. Lost or stolen packages will not be refunded or replaced by Clamáre.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>RETURNS AND REFUNDS</p>
                                <p style={{ margin: 0 }}>
                                    All sales are final. Refund requests will be reviewed on a case-by-case basis and must be submitted within 14 days of receiving your order.
                                    Products must be in their original condition and packaging to be eligible for consideration.
                                    Clamáre reserves the right to deny refunds for items that show signs of use or damage.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>INTELLECTUAL PROPERTY</p>
                                <p style={{ margin: 0 }}>
                                    All content on our website, including text, images, logos, and designs, is the exclusive property of Clamáre.
                                    Unauthorized use, reproduction, or distribution is strictly prohibited and may result in legal action.
                                    Accessing or using this website does not grant you ownership or rights to any intellectual property.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>DISCLAIMERS AND LIMITATIONS OF LIABILITY</p>
                                <p style={{ margin: 0 }}>
                                    Clamáre provides this website and its content on an "as is" basis without warranties of any kind, express or implied.
                                    We disclaim all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
                                    Clamáre is not liable for indirect, incidental, or consequential damages arising from your use of the site, including loss of data, revenue, or profits.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </Fade>
    );

};

export default SupportScreen;