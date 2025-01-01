import React, { useState, useRef, useEffect } from 'react';
import { MdArrowDropDown, MdArrowDropUp, MdOutlineArrowOutward } from 'react-icons/md';
import Input from '../shared/UI/Input'
import Button from '../shared/UI/Button';
import { Fade, MenuItem, TextField } from '@mui/material';

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
    const [reason, setReason] = useState('')

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
            <div>
                <div style={{ borderBottom: '1px solid var(--border-color)', padding: '10px', }}>
                    <p style={{ margin: 'auto', maxWidth: '700px', fontSize: '12px', fontWeight: '600', marginTop: 0, marginBottom: 0 }}>CUSTOMER SERVICE CENTER</p>
                </div>
                <div style={{
                    maxWidth: '700px',
                    margin: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}>
                    <div style={{ marginTop: '40px' }}>
                        <img src="" style={{ width: '100%', height: '150px' }} />
                    </div>
                    <div style={{ position: 'sticky', top: '49px', backgroundColor: 'var(--main-bg-color)', paddingTop: '30px', zIndex: 30 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', padding: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--main-bg-color)', zIndex: 20 }}>
                            <p style={{ margin: 0 }}>FAQ</p>
                            <p style={{ margin: 0 }}>CONTACT</p>
                            <p style={{ margin: 0 }}>TERMS OF USE</p>

                            <p style={{ margin: 0 }}>INSTAGRAM</p>
                        </div>
                    </div>
                    <div style={{
                        height: '100%',
                    }}>
                        <div
                            style={{
                                position: 'sticky',
                                top: 133,
                                backgroundColor: 'var(--main-bg-color)',
                                zIndex: 1,
                                padding: '10px 20px 10px 20px',
                                marginBottom: '-1px',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <p style={{ fontWeight: 600, fontSize: '12px', margin: 0 }}>FREQUENTLY ASKED QUESTIONS</p>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', overflowY: 'auto' }}>
                            <div style={{ marginTop: '-1px' }}>
                                {questions.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '20px',
                                            borderTop: '1px solid var(--border-color)',
                                            fontSize: '12px',
                                            fontWeight: '580',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => toggleExpand(index)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ margin: 0 }}>{item.question}</p>
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
                    <div style={{
                        height: '100%',
                    }}>
                        <div
                            style={{
                                position: 'sticky',
                                top: 133,
                                backgroundColor: 'var(--main-bg-color)',
                                zIndex: 10,
                                padding: '10px 20px 10px 20px',
                                marginBottom: '-1px',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <p style={{ fontWeight: 600, fontSize: '12px', margin: 0 }}>CONTACT US</p>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)' }}>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <Input label="FIRST NAME" outlined={true} />
                                    <Input label="LAST NAME" outlined={true} />
                                </div>
                                <Input label="EMAIL" outlined={true} />
                                <TextField
                                    select
                                    label="REASON"
                                    value={reason}
                                    onChange={(e) => {
                                        setReason(e.target.value)
                                    }}
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 0,
                                            height: '50px',
                                            padding: '0px',
                                            fontSize: '12px',
                                            boxSizing: 'border-box',
                                            fontWeight: '580',
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
                                            marginTop: reason ? '5px' : '0px',
                                            fontWeight: '600',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'var(--main-color)',
                                            fontSize: '12px',
                                            marginTop: '5px',
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: 'var(--sec-bg-color)',
                                                color: 'var(--main-color)',
                                                border: '1px solid var(--border-color)',
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '12px',
                                                    padding: '10px',
                                                    '&:hover': {
                                                        backgroundColor: 'var(--border-color)',
                                                        color: 'var(--main-color)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'var(--border-color) !important',
                                                        color: 'var(--main-color) !important',
                                                    },
                                                    '&.Mui-selected:hover': {
                                                        backgroundColor: 'var(--border-color)',
                                                        color: 'var(--main-color)',
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {reasons.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    id="outlined-multiline-static"
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
                                            fontWeight: '580',
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
                                            fontWeight: '600',
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

                                <Button>SEND A MESSAGE</Button>

                            </div>
                        </div>
                        <br />
                        <div style={{ padding: '20px', fontSize: '12px', fontWeight: '580', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>CONTACT</p>
                                <p style={{ margin: 0, marginTop: '5px' }}>clamare@gmail.com</p>
                            </div>
                            <p style={{ fontSize: '21px', fontWeight: '700', margin: 0 }}><MdOutlineArrowOutward /></p>
                        </div>
                    </div>
                    <div style={{
                        height: '100%',
                    }}>
                        <div
                            style={{
                                position: 'sticky',
                                top: 133,
                                backgroundColor: 'var(--main-bg-color)',
                                zIndex: 1,
                                padding: '10px 20px 10px 20px',
                                marginBottom: '-1px',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <p style={{ fontWeight: 600, fontSize: '12px', margin: 0 }}>SHIPPING & RETURNS</p>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', overflowY: 'auto' }}>
                            <div style={{ padding: '20px' }}>
                                <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>SHIPPING</p>
                                <p style={{ fontSize: '14px', margin: 0, marginTop: '10px' }}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam, nam tenetur mollitia, reiciendis nesciunt tempore sit laudantium, sunt vero iste eos ducimus dolore et! Minima quas ratione placeat quos dolor?</p>
                                <p style={{ fontSize: '14px', margin: 0, marginTop: '10px' }}>Elit. Ipsam, nam tenetur mollitia, reiciendis nesciunt tempore sit laudantium, sunt vero iste eos ducimus dolore et! Minima quas ratione placeat quos dolor?</p>
                                <p style={{ fontSize: '14px', margin: 0, marginTop: '10px' }}>Adipisicing elit. Ipsam, nam tenetur mollitia, reiciendis nesciunt tempore sit laudantium, sunt vero iste eos ducimus dolore et! Minima quas ratione placeat quos dolor?</p>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>RETURNS</p>
                                <p style={{ fontSize: '14px', margin: 0, marginTop: '10px' }}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam, nam tenetur mollitia, reiciendis nesciunt tempore sit laudantium, sunt vero iste eos ducimus dolore et! Minima quas ratione placeat quos dolor?</p>
                                <p style={{ fontSize: '14px', margin: 0, marginTop: '10px' }}>Elit. Ipsam, nam tenetur mollitia, reiciendis nesciunt tempore sit laudantium, sunt vero iste eos ducimus dolore et! Minima quas ratione placeat quos dolor?</p>
                                <p style={{ fontSize: '14px', margin: 0, marginTop: '10px' }}>Adipisicing elit. Ipsam, nam tenetur mollitia, reiciendis nesciunt tempore sit laudantium, sunt vero iste eos ducimus dolore et! Minima quas ratione placeat quos dolor?</p>
                            </div>
                            <p style={{ padding: '20px', fontSize: 14, fontWeight: '600', margin: 0 }}>IF YOU HAVE ANY QUESTIONS - YOU CAN CONTACT US HERE</p>
                        </div>
                    </div>
                    <div style={{ padding: '20px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Thank you for choosing Clamáre!</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>GO UP</p>
                    </div>
                    <div style={{ height: '30px' }}></div>
                </div>
            </div>
        </Fade>
    );

};

export default SupportScreen;
