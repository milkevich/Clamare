import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Fade, Slide, TextField, MenuItem } from '@mui/material';
import { MdKeyboardArrowLeft } from 'react-icons/md';

import client from '../utils/shopify';
import Loader from '../shared/UI/Loader';
import Button from '../shared/UI/Button';
import Input from '../shared/UI/Input';

const usStates = [
    { value: 'AL', label: 'ALABAMA' },
    { value: 'AK', label: 'ALASKA' },
    { value: 'AZ', label: 'ARIZONA' },
    { value: 'AR', label: 'ARKANSAS' },
    { value: 'CA', label: 'CALIFORNIA' },
    { value: 'CO', label: 'COLORADO' },
    { value: 'CT', label: 'CONNECTICUT' },
    { value: 'DE', label: 'DELAWARE' },
    { value: 'FL', label: 'FLORIDA' },
    { value: 'GA', label: 'GEORGIA' },
    { value: 'HI', label: 'HAWAII' },
    { value: 'ID', label: 'IDAHO' },
    { value: 'IL', label: 'ILLINOIS' },
    { value: 'IN', label: 'INDIANA' },
    { value: 'IA', label: 'IOWA' },
    { value: 'KS', label: 'KANSAS' },
    { value: 'KY', label: 'KENTUCKY' },
    { value: 'LA', label: 'LOUISIANA' },
    { value: 'ME', label: 'MAINE' },
    { value: 'MD', label: 'MARYLAND' },
    { value: 'MA', label: 'MASSACHUSETTS' },
    { value: 'MI', label: 'MICHIGAN' },
    { value: 'MN', label: 'MINNESOTA' },
    { value: 'MS', label: 'MISSISSIPPI' },
    { value: 'MO', label: 'MISSOURI' },
    { value: 'MT', label: 'MONTANA' },
    { value: 'NE', label: 'NEBRASKA' },
    { value: 'NV', label: 'NEVADA' },
    { value: 'NH', label: 'NEW HAMPSHIRE' },
    { value: 'NJ', label: 'NEW JERSEY' },
    { value: 'NM', label: 'NEW MEXICO' },
    { value: 'NY', label: 'NEW YORK' },
    { value: 'NC', label: 'NORTH CAROLINA' },
    { value: 'ND', label: 'NORTH DAKOTA' },
    { value: 'OH', label: 'OHIO' },
    { value: 'OK', label: 'OKLAHOMA' },
    { value: 'OR', label: 'OREGON' },
    { value: 'PA', label: 'PENNSYLVANIA' },
    { value: 'RI', label: 'RHODE ISLAND' },
    { value: 'SC', label: 'SOUTH CAROLINA' },
    { value: 'SD', label: 'SOUTH DAKOTA' },
    { value: 'TN', label: 'TENNESSEE' },
    { value: 'TX', label: 'TEXAS' },
    { value: 'UT', label: 'UTAH' },
    { value: 'VT', label: 'VERMONT' },
    { value: 'VA', label: 'VIRGINIA' },
    { value: 'WA', label: 'WASHINGTON' },
    { value: 'WV', label: 'WEST VIRGINIA' },
    { value: 'WI', label: 'WISCONSIN' },
    { value: 'WY', label: 'WYOMING' },
];

const caProvinces = [
    { value: 'AB', label: 'ALBERTA' },
    { value: 'BC', label: 'BRITISH COLUMBIA' },
    { value: 'MB', label: 'MANITOBA' },
    { value: 'NB', label: 'NEW BRUNSWICK' },
    { value: 'NL', label: 'NEWFOUNDLAND & LABRADOR' },
    { value: 'NS', label: 'NOVA SCOTIA' },
    { value: 'NT', label: 'NORTHWEST TERRITORIES' },
    { value: 'NU', label: 'NUNAVUT' },
    { value: 'ON', label: 'ONTARIO' },
    { value: 'PE', label: 'PRINCE EDWARD ISLAND' },
    { value: 'QC', label: 'QUEBEC' },
    { value: 'SK', label: 'SASKATCHEWAN' },
    { value: 'YT', label: 'YUKON' },
];

export const countries = [
    { value: 'AR', label: 'ARGENTINA' },
    { value: 'BR', label: 'BRAZIL' },
    { value: 'CA', label: 'CANADA' },
    { value: 'CO', label: 'COLOMBIA' },
    { value: 'CR', label: 'COSTA RICA' },
    { value: 'DO', label: 'DOMINICAN REPUBLIC' },
    { value: 'EC', label: 'ECUADOR' },
    { value: 'HK', label: 'HONG KONG' },
    { value: 'HU', label: 'HUNGARY' },
    { value: 'ID', label: 'INDONESIA' },
    { value: 'IL', label: 'ISRAEL' },
    { value: 'KW', label: 'KUWAIT' },
    { value: 'MY', label: 'MALAYSIA' },
    { value: 'MX', label: 'MEXICO' },
    { value: 'PA', label: 'PANAMA' },
    { value: 'PH', label: 'PHILIPPINES' },
    { value: 'QA', label: 'QATAR' },
    { value: 'RU', label: 'RUSSIA' },
    { value: 'SA', label: 'SAUDI ARABIA' },
    { value: 'SG', label: 'SINGAPORE' },
    { value: 'TW', label: 'TAIWAN' },
    { value: 'AE', label: 'UNITED ARAB EMIRATES' },
    { value: 'UA', label: 'UKRAINE' },
    { value: 'UY', label: 'URUGUAY' },
    { value: 'VN', label: 'VIETNAM' },
    { value: 'ZA', label: 'SOUTH AFRICA' },
    { value: 'US', label: 'UNITED STATES' },
];
const ManageAddresses = () => {
    const { customer } = useContext(AuthContext);
    const [addresses, setAddresses] = useState([]);
    const [defaultAddressId, setDefaultAddressId] = useState(null);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [showOptionsPopUp, setShowOptionsPopUp] = useState(null);
    const [showNewAddressPopUp, setShowNewAddressPopUp] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('US');
    const [phone, setPhone] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 500);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const togglePopUp = () => {
        if (!showNewAddressPopUp) {
            document.body.style.overflow = 'hidden';
            setShowNewAddressPopUp(true);
        } else {
            document.body.style.overflow = '';
            setShowNewAddressPopUp(false);
        }
    };

    const openAddAddress = () => {
        setFirstName('');
        setLastName('');
        setAddress1('');
        setAddress2('');
        setCity('');
        setRegion('');
        setZip('');
        setCountry('US');
        setPhone('');
        togglePopUp();
    };

    const fetchAddresses = async () => {
        if (!customer) return;
        setAddressesLoading(true);

        const query = `
        query customerAddresses($customerAccessToken: String!) {
          customer(customerAccessToken: $customerAccessToken) {
            defaultAddress { id }
            addresses(first: 100) {
              edges {
                node {
                  id
                  address1
                  address2
                  city
                  province
                  country
                  zip
                  phone
                  firstName
                  lastName
                }
              }
            }
          }
        }
      `;
        const variables = {
            customerAccessToken: localStorage.getItem('shopify_access_token'),
        };

        try {
            const response = await client.post('', { query, variables });
            if (response.data.errors) {
                return;
            }

            const data = response.data.data.customer;
            if (!data) return;

            setDefaultAddressId(data.defaultAddress?.id || null);

            const fetchedAddresses = data.addresses.edges.map((edge) => edge.node);
            setAddresses(fetchedAddresses);
        } catch (error) {
        } finally {
            setAddressesLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [customer]);

    if (!customer) {
        return null;
    }

    const handleCreateAddress = async () => {
        if (!firstName || !address1 || !city || !zip) {
            alert('Please fill in all required fields.');
            return;
        }

        const mutation = `
        mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
          customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
            customerAddress {
              id
            }
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `;

        const variables = {
            customerAccessToken: localStorage.getItem('shopify_access_token'),
            address: {
                firstName,
                lastName,
                address1,
                address2,
                city,
                province: region,
                country,
                zip,
                phone,
            },
        };

        try {
            const response = await client.post('', { query: mutation, variables });

            const errors = response.data.data.customerAddressCreate.customerUserErrors;
            if (errors.length) {
                alert(errors[0].message);
                return;
            }
            await fetchAddresses();
            togglePopUp();
        } catch (err) {
        }
    };

    const handleDeleteAddress = async (id) => {
        const mutation = `
        mutation customerAddressDelete($id: ID!, $customerAccessToken: String!) {
          customerAddressDelete(id: $id, customerAccessToken: $customerAccessToken) {
            deletedCustomerAddressId
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `;
        const variables = {
            id,
            customerAccessToken: localStorage.getItem('shopify_access_token'),
        };

        try {
            const response = await client.post('', { query: mutation, variables });

            const userErrors = response.data.data.customerAddressDelete.customerUserErrors;
            if (userErrors.length) {
                alert(userErrors[0].message);
                return;
            }
            await fetchAddresses();
        } catch (err) {
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        const mutation = `
        mutation customerDefaultAddressUpdate($addressId: ID!, $customerAccessToken: String!) {
          customerDefaultAddressUpdate(addressId: $addressId, customerAccessToken: $customerAccessToken) {
            customer {
              defaultAddress {
                id
              }
            }
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `;
        const variables = {
            addressId,
            customerAccessToken: localStorage.getItem('shopify_access_token'),
        };

        try {
            const response = await client.post('', { query: mutation, variables });

            const errors = response.data.data.customerDefaultAddressUpdate.customerUserErrors;
            if (errors.length) {
                alert(errors[0].message);
                return;
            }
            await fetchAddresses();
        } catch (err) {
        }
    };

    let regionOptions = [];
    if (country === 'US') {
        regionOptions = usStates;
    } else if (country === 'CA') {
        regionOptions = caProvinces;
    }

    return (
        <Fade in={!addressesLoading}>
            <div>
                <Fade in={showNewAddressPopUp}>
                    <div
                        onClick={() => setShowNewAddressPopUp(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            zIndex: 100,
                            width: '100vw',
                            height: '100vh',
                        }}
                    />
                </Fade>

                <Slide in={showNewAddressPopUp} direction="up">
                    <div
                        style={{
                            height: isSmallScreen ? 'calc(100dvh - 50px)' : '100vh',
                            backgroundColor: 'var(--main-bg-color)',
                            width: '100%',
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            zIndex: 102,
                        }}
                    >
                        <div
                            style={{
                                fontSize: '12px',
                                fontWeight: '580',
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: isSmallScreen ? '0.75rem' : '1rem 1.25rem',
                                backgroundColor: 'var(--main-bg-color)',
                                borderBottom: '1px solid var(--border-color)',
                            }}
                        >
                            <p style={{ margin: 0 }}>ADD NEW ADDRESS</p>
                            <p
                                onClick={togglePopUp}
                                style={{ margin: 0, cursor: 'pointer', color: 'var(--sec-color)' }}
                            >
                                CLOSE
                            </p>
                        </div>

                        <div style={{ maxWidth: '700px', margin: 'auto' }}>
                            <div
                                style={{
                                    height: 'calc(100dvh - 120px)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    flexDirection: 'column',
                                    overflowY: 'scroll',
                                }}
                            >
                                <div
                                    style={{
                                        padding: isSmallScreen ? '0.75rem' : '1.25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: isSmallScreen ? '3.25vh' : '1.25rem',
                                        margin: 0,
                                        paddingBottom: isSmallScreen && '5rem'
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: 0, fontSize: '32px', fontWeight: '900' }}>
                                            NEW ADDRESS
                                        </p>
                                        <p
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: '580',
                                                marginTop: '0.5rem',
                                                marginBottom: '1rem',
                                                color: 'var(--sec-color)',
                                            }}
                                        >
                                            Please fill in your information in order to add an address.
                                        </p>
                                    </div>

                                    {/* FIRST/LAST NAME */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: '1.25rem',
                                        }}
                                    >
                                        <Input
                                            outlined={false}
                                            label="FIRST NAME"
                                            value={firstName}
                                            required
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                        <Input
                                            outlined={false}
                                            label="LAST NAME"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>

                                    {/* ADDRESS 1/2, CITY */}
                                    <Input
                                        outlined={false}
                                        label="ADDRESS 1"
                                        value={address1}
                                        required
                                        onChange={(e) => setAddress1(e.target.value)}
                                    />
                                    <Input
                                        outlined={false}
                                        label="ADDRESS 2"
                                        value={address2}
                                        onChange={(e) => setAddress2(e.target.value)}
                                    />
                                    <Input
                                        outlined={false}
                                        label="CITY"
                                        required
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />

                                    {/* STATE/PROVINCE */}
                                    {regionOptions.length > 0 ? (
                                        <TextField
                                            select
                                            label="STATE/PROVINCE"
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            variant="standard"
                                            fullWidth
                                            required={regionOptions.length > 0}
                                            sx={{
                                                fontSize: '12px',
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
                                                        boxShadow: '0px 34px 300px -102px rgba(0,0,0,0.75)',
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
                                            {regionOptions.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    ) : (
                                        <Input
                                            outlined={false}
                                            label="STATE/PROVINCE"
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                        />
                                    )}

                                    {/* ZIP */}
                                    <Input
                                        outlined={false}
                                        label="POSTAL/ZIP CODE"
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value)}
                                    />

                                    {/* COUNTRY */}
                                    <TextField
                                        select
                                        label="COUNTRY"
                                        value={country}
                                        onChange={(e) => {
                                            setCountry(e.target.value);
                                            setRegion('');
                                        }}
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
                                                    boxShadow: '0px 34px 300px -102px rgba(0,0,0,0.75)',
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
                                        {countries.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <Input
                                        outlined={false}
                                        label="PHONE NUMBER"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* BOTTOM BUTTONS */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: isSmallScreen ? '0.75rem' : '1.25rem',
                                    position: 'sticky',
                                    bottom: 0,
                                    padding: isSmallScreen ? '0.75rem' : '1.25rem',
                                }}
                            >
                                <Button secondary={true} onClick={togglePopUp}>
                                    CANCEL
                                </Button>
                                <Button
                                    disabled={
                                        !firstName ||
                                        !address1 ||
                                        !city ||
                                        !zip ||
                                        (
                                            (country === 'US' || country === 'CA') &&
                                            !region
                                        )
                                    }
                                    onClick={handleCreateAddress}
                                >
                                    SAVE
                                </Button>

                            </div>
                        </div>
                    </div>
                </Slide>

                {/* BACK / NAV BAR */}
                <div
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        padding: isSmallScreen ? '0.5rem 0.75rem' : '0.5rem 1.25rem',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: 'var(--main-bg-color)',
                        zIndex: 60,
                        position: 'sticky',
                        top: 48,
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/account')}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            maxWidth: '1300px',
                            margin: 'auto',
                            width: '100%',
                        }}
                    >
                        <MdKeyboardArrowLeft size={12} /> BACK TO SHOP
                    </p>
                </div>

                {/* MAIN CONTENT */}
                <div style={{ maxWidth: '700px', margin: 'auto' }}>
                    <p
                        style={{
                            fontSize: '32px',
                            fontWeight: '900',
                            margin: 'auto',
                            padding: isSmallScreen ? '0.75rem' : '1.25rem',
                        }}
                    >
                        MANAGE ADDRESSES
                    </p>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            minHeight: 'calc(100dvh - 195px)',
                        }}
                    >
                        {addressesLoading ? (
                            <Loader />
                        ) : addresses.length > 0 ? (
                            <ul
                                style={{
                                    margin: 0,
                                    float: 'left',
                                    padding: 0,
                                    fontSize: '12px',
                                    listStyle: 'none',
                                    width: '100%',
                                }}
                            >
                                {addresses.map((address) => {
                                    const isDefault = address.id === defaultAddressId;

                                    return (
                                        <li
                                            key={address.id}
                                            style={{
                                                margin: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.25rem',
                                                padding: isSmallScreen ? '1.25rem 0.75rem' : '1.25rem',
                                                borderBottom: '1px solid var(--border-color)',
                                            }}
                                        >
                                            {/* If default, show a small label */}
                                            {isDefault && (
                                                <p
                                                    style={{
                                                        fontSize: '10px',
                                                        color: 'var(--sec-color)',
                                                        margin: 0,
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    DEFAULT
                                                </p>
                                            )}

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <p style={{ margin: 0 }}>
                                                    {address.firstName} {address.lastName}
                                                </p>
                                                <p
                                                    onClick={() => {
                                                        if (!showOptionsPopUp) {
                                                            setShowOptionsPopUp(address.id);
                                                        } else {
                                                            setShowOptionsPopUp(null);
                                                        }
                                                    }}
                                                    style={{ fontWeight: '600', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                >
                                                    OPTIONS <MdKeyboardArrowLeft size={14} style={{ transform: showOptionsPopUp ? 'rotate(90deg)' : 'rotate(-90deg)', marginTop: '-1px' }} />
                                                </p>
                                            </div>
                                            <p style={{ margin: 0 }}>
                                                {address.address1}
                                                {address.address2 && `, ${address.address2}`}
                                            </p>
                                            <p style={{ margin: 0 }}>
                                                {address.city}, {address.province}, {address.zip}
                                            </p>
                                            <p style={{ margin: 0 }}>{address.country}</p>
                                            <p style={{ margin: 0 }}>{address.phone}</p>

                                            {/* Show "OPTIONS" sub-menu if this address is toggled */}
                                            {showOptionsPopUp === address.id && (
                                                <div
                                                    style={{
                                                        fontSize: '10px',
                                                        display: 'flex',
                                                        gap: '1rem',
                                                        marginTop: '1rem',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {/* DELETE */}
                                                    <p
                                                        style={{ margin: 0, cursor: 'pointer' }}
                                                        onClick={() => handleDeleteAddress(address.id)}
                                                    >
                                                        DELETE
                                                    </p>

                                                    {/* SET AS DEFAULT (only if not default) */}
                                                    {!isDefault && (
                                                        <p
                                                            style={{ margin: 0, cursor: 'pointer' }}
                                                            onClick={() => handleSetDefaultAddress(address.id)}
                                                        >
                                                            SET AS DEFAULT
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div style={{ padding: isSmallScreen ? '0.75rem' : '1.25rem' }}>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>
                                    NO ADDRESSES FOUND.
                                </p>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: '580', color: 'var(--sec-color)' }}>
                                    Add an address by clicking 'NEW ADDRESS'.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM BUTTON TO ADD NEW ADDRESS */}
                <div
                    style={{
                        padding: isSmallScreen ? '0.75rem' : '1.25rem',
                        backgroundColor: 'var(--main-bg-color)',
                        borderTop: '1px solid var(--border-color)',
                        position: 'sticky',
                        bottom: 0,
                    }}
                >
                    <div style={{ maxWidth: 'calc(700px - 2.5rem)', margin: 'auto' }}>
                        <Button onClick={openAddAddress}>NEW ADDRESS</Button>
                    </div>
                </div>
            </div>
        </Fade>
    );
};

export default ManageAddresses;