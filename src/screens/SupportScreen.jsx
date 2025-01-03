import React, { useState, useRef, useEffect } from 'react';
import { MdArrowDropDown, MdArrowDropUp, MdKeyboardArrowLeft, MdOutlineArrowOutward } from 'react-icons/md';
import Input from '../shared/UI/Input'
import Button from '../shared/UI/Button';
import { Fade, MenuItem, TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const questions = [
    {
        question: 'Can I make modifications to my order after it\'s been placed?',
        answer: 'Once an order has been confirmed, it can\'t be modified or adjusted.',
    },
    {
        question: 'I used the incorrect address. How can I update it?',
        answer: 'Address updates can be requested, but are not guaranteed. Please review your information before you checkout.',
    },
    {
        question: 'How can I cancel my order?',
        answer: 'Reach out to customer support with your order number and email address to submit a cancellation request. If your order was placed during peak periods or over the weekend, cancellations may not be possible. Cancellations are not guaranteed. Disclaimer: The abuse of cancellations that are deemed as unusual activity will be suspended from future cancellations. For more information, please review our terms of use.',
    },
    {
        question: 'How do I know my order is confirmed?',
        answer: 'Every order is subject to review. The order is confirmed once you receive a shipping confirmation email. Please check your spam inbox.',
    },
    {
        question: 'When will I receive my order?',
        answer: 'Orders are processed Monday – Friday and shipped within 3-7 business days, excluding the weekend and major holidays.\n\nOnce your order is shipped, you will receive a shipping confirmation email with your tracking information. Allow 48-72 business hours for your tracking information to update with an estimated delivery date.',
    },
    {
        question: 'Do you ship internationally?',
        answer: 'Yes. Orders shipped outside the U.S. are subject to non-refundable customs duties/taxes. Global-E has enabled us to allow the payment of stated fees at the time of checkout.\n\nStussy.com ships to the following countries: AR, BR, CA, CO, CR, DO, EC, HK, HU, ID, IL, KW, MY, MX, PA, PH, QA, RU, SA, SG, TW, AE, UA, UY, VN, ZA.',
    },
    {
        question: 'My tracking information states that my order was delivered, but I have not received it. What does this mean?',
        answer: 'Allow 48 hours after the stated delivery time for your package to show up. If your package hasn\'t been delivered, please contact support@stussy.com.',
    },
    {
        question: 'Why was my order canceled?',
        answer: 'If your order was canceled, we advise you to contact your financial institution to ensure your information is up to date. Cancellations may also be affected by limited stock availability.',
    },
    {
        question: 'What payment methods do you take?',
        answer: 'Stussy.com and Global-E accept all major credit cards including: Visa, MasterCard, American Express, Discover, and PayPal. Payments made via PayPal must be purchased by a verified account with a confirmed shipping address.\n\nOther payment methods will vary per region: Apple Pay, Google Pay, etc.\n\nInternational orders will appear as Global-E on bank statements.',
    },
    {
        question: 'How do I know if an item will fit?',
        answer: 'In order to identify the best fit, please visit our size guide. Additional fit details with measurements are found on the product page specific to the item. Measurements are displayed in inches unless otherwise noted. For assistance, please contact support@stussy.com.',
    },
    {
        question: 'How do I find out when new styles are released?',
        answer: 'Subscribe to our newsletter or follow us on Instagram for early release information.',
    },
    {
        question: 'When can I expect a response from customer support?',
        answer: 'Our team will respond within 24-72 hours, excluding weekends and major holidays.',
    },
    {
        question: 'My package is being returned to sender. What are the next steps?',
        answer: 'Once your order has been returned to our warehouse, it will be fully refunded upon delivery. We do not re-ship orders.',
    },
    {
        question: 'I placed multiple orders, can I combine them?',
        answer: 'Once your order is placed, we are unable to combine shipments on multiple orders.',
    },
    {
        question: 'I received a damaged product, what should I do?',
        answer: 'Please contact support@stussy.com within 24-48 hours of delivery. We ask you to provide detailed images of the product(s) in question along with the packing/invoice slip.',
    },
    {
        question: 'Can I return my online order in store?',
        answer: 'Online orders must be returned through our online return portal as chapter stores only accept returns for in-store purchases. No exceptions.',
    },
    {
        question: 'I received a tracking number, but the shipment hasn\'t moved.',
        answer: 'Tracking numbers are generated when your shipping label is created. Allow 1-3 business days for the courier to scan the package for updates.',
    },
    {
        question: 'Can I return collaboration items?',
        answer: 'All sales are final for any purchases on Nike, limited editions, and special collaboration items.',
    },
    {
        question: 'If an item is sold out, when will it be available again?',
        answer: 'Stussy.com displays real-time inventory. Unfortunately, an item is no longer available if you don\'t see it on our website. Please note some items will allow you to sign up for back-in-stock notifications in product details.',
    },
    {
        question: 'My order is a gift, do you include the price in the package?',
        answer: 'We do not include prices on our packing slips.',
    },
    {
        question: 'Do you offer gift receipts or gift cards?',
        answer: 'We do not offer gift receipts or gift cards.',
    },
    {
        question: 'I received an item from Stussy.com as a gift. Can I return it or exchange it?',
        answer: 'We do not offer exchanges. You will have to contact the purchaser to return the product and purchase the updated item we have in stock.',
    },
    {
        question: 'Can I get some free stickers?',
        answer: 'Stickers are provided in online orders, but are not guaranteed as they are provided based on availability.',
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

    const [reason, setReason] = useState('');
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isSmallScreen2, setIsSmallScreen2] = useState(false);

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
                            navigate('/')
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
                                        <Input label="FIRST NAME" outlined={false} />
                                        <Input label="LAST NAME" outlined={false} />
                                    </div>
                                    <Input label="EMAIL" outlined={false} />
                                    <TextField
                                        select
                                        label="REASON"
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
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
                                    <Button>SEND A MESSAGE</Button>
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
                                        <Input label="FIRST NAME" outlined={false} />
                                        <Input label="LAST NAME" outlined={false} />
                                    </div>
                                    <Input label="EMAIL" outlined={false} />
                                    <TextField
                                        select
                                        label="REASON"
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
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
                                    <Button>SEND A MESSAGE</Button>
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
                {selectedSection === 'Legal' &&
                    <div style={{ maxWidth: '1300px', margin: 'auto', padding: isSmallScreen2 ? '0.75rem' : '1.25rem' }}>
                        <div ref={legalRef} style={{ height: '3rem', display: !isSmallScreen && 'none' }}></div>
                        <div style={{ maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <p style={{ fontSize: isSmallScreen ? '32px' : '24px', margin: 0, padding: '2rem 0rem 1.5rem 0rem', fontWeight: '900' }}>TERMS OF USE</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                        </div>
                        <div style={{ maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <p style={{ fontSize: '24px', margin: 0, padding: '3rem 0rem', fontWeight: '900' }}>SHIPPING POLICY</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                        </div>
                        <div style={{ maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <p style={{ fontSize: '24px', margin: 0, padding: '3rem 0rem', fontWeight: '900' }}>PRIVACY POLICY</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '12px', fontWeight: '580' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', padding: '0.5rem 0rem' }}>TITLE LALALALA</p>
                                <p style={{ margin: 0 }}>Lorem consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias odit impedit similique?</p>
                                <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur quisquam in deleniti dignissimos blanditiis quia magnam nostrum animi saepe rerum, quibusdam, ea quis soluta maxime, error alias</p>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </Fade>
    );

};

export default SupportScreen;
