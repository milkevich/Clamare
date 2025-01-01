import React from 'react';

const ShippingOption = ({ option, isSelected, onSelect }) => {
    return (
        <label
            onClick={onSelect}
            style={{
                display: 'flex',
                fontSize: '12px',
                borderBottom: '1px solid var(--sec-color)',
                gap: '10px',
                padding: '10px',
                height: '33px',
                alignItems: 'center',
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--border-color)' : 'transparent',
                transition: 'background-color 0.3s',
            }}
        >
            <input
                type="radio"
                name="shippingOption"
                checked={isSelected}
                onChange={onSelect}
                style={{
                    appearance: 'none',
                    width: '16px',
                    height: '16px',
                    border: '2px solid var(--main-color)',
                    borderRadius: '50%',
                    outline: 'none',
                    cursor: 'pointer',
                    marginTop: -2
                }}
            />
            <span
                style={{
                    position: 'relative',
                    right: '25px',
                    top: '-1px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'black',
                    borderRadius: '50%',
                    display: 'inline-block',
                    scale: isSelected ? '1' : '0',
                    transition: '0.3s ease-in-out all',
                }}
            />
                <p style={{ margin: 0, fontWeight: '600', marginTop: '2px', fontSize: '12px' }}>{option.provider} - {option.servicelevel.toUpperCase()} <span style={{fontWeight: '580'}}>- ${parseFloat(option.amount).toFixed(2)} ({option.estimated_days} {option.estimated_days === 1 ? 'DAY' : 'DAYS'})</span></p>
        </label>
    );
};

export default ShippingOption;
