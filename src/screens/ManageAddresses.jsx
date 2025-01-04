import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Fade } from '@mui/material';
import client from '../utils/shopify';
import Loader from '../shared/UI/Loader';
import Button from '../shared/UI/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';

const ManageAddresses = () => {
    const { customer } = useContext(AuthContext);
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 500);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (customer) {
                const query = `
              query customerAddresses($customerAccessToken: String!) {
                customer(customerAccessToken: $customerAccessToken) {
                  addresses(first: 20) {
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
                    console.log('Addresses Response:', response.data);
                    if (response.data.errors) {
                        console.error('GraphQL Errors:', response.data.errors);
                        return;
                    }
                    const fetchedAddresses = response.data.data.customer.addresses.edges.map(edge => edge.node);
                    setAddresses(fetchedAddresses);
                } catch (error) {
                    console.error('Error fetching addresses:', error);
                } finally {
                    setAddressesLoading(false);
                }
            }
        };

        fetchAddresses();
    }, [customer]);

    if (!customer) {
        return null;
    }

    return (
        <Fade in={!addressesLoading}>
            <div>
                <div
                    style={{display: 'flex', gap: '0.5rem', padding: '0.5rem 1.25rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--main-bg-color)', zIndex: 60, position: 'sticky', top: 48, cursor: 'pointer'  }}
                    onClick={() => navigate('/account')}
                >
                    <p style={{margin: 0, fontSize: '10px', display: 'flex', alignItems: 'center', maxWidth: '1300px', margin: 'auto', width: '100%'}}>
                        <MdKeyboardArrowLeft size={12} /> BACK TO SHOP
                    </p>
                </div>
                <div style={{maxWidth: '700px', margin: 'auto'}}>
                <p style={{ fontSize: '32px', fontWeight: '900', margin: 'auto', padding: '1.25rem' }}>MANAGE ADDRESSES</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 'calc(100dvh - 195px)' }}>
                    {addressesLoading ? (
                        <Loader />
                    ) : addresses.length > 0 ? (
                        <ul style={{ margin: 0, float: 'left', padding: 0, fontSize: '12px' }}>
                            {addresses.map(address => (
                                <li key={address.id} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <p style={{ margin: 0 }}>{address.firstName} {address.lastName}</p>
                                    <p style={{ margin: 0 }}>{address.address1}{address.address2 && `, ${address.address2}`}</p>
                                    <p style={{ margin: 0 }}>{address.city}, {address.province}, {address.zip}</p>
                                    <p style={{ margin: 0 }}>{address.country}</p>
                                    <p style={{ margin: 0 }}>{address.phone}</p>
                                    <p style={{ fontSize: '10px', fontWeight: '600' }}>DELETE</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>NO ADDRESSES FOUND.</p>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '580' }}>Add address by clicking 'NEW ADDRESS'.</p>
                        </div>)}
                </div>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--main-bg-color)', borderTop: '1px solid var(--border-color)', position: 'sticky', bottom: 0 }}>
                    <div style={{maxWidth: 'calc(700px - 2.5rem)', margin: 'auto',}}>
                        <Button>NEW ADDRESS</Button>
                    </div>
                </div>
            </div>
        </Fade>
    )
}

export default ManageAddresses