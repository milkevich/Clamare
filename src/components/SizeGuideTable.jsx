import React, { useState, useEffect } from 'react';
import Button from '../shared/UI/Button';
import Input from '../shared/UI/Input';

const SizeChartTable = ({ selectedSizes, onChartChange }) => {
    const [rows, setRows] = useState([]);
    const [newRowName, setNewRowName] = useState('');

    const handleValueChange = (rowIndex, size, value) => {
        const updatedRows = rows.map((row, index) => {
            if (index === rowIndex) {
                return {
                    ...row,
                    values: {
                        ...row.values,
                        [size]: value,
                    },
                };
            }
            return row;
        });
        setRows(updatedRows);
    };

    const handleAddRow = () => {
        if (newRowName.trim() !== '') {
            const newRow = { name: newRowName, values: {} };
            selectedSizes.forEach((size) => {
                newRow.values[size] = ''; 
            });
            const updated = [...rows, newRow];
            setRows(updated);
            setNewRowName('');
        }
    };

    useEffect(() => {
        onChartChange(rows);
    }, [rows, onChartChange]);

    return (
        <div style={{ margin: 'auto', fontSize: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: 'var(--main-bg-color)' }}>
                        <th style={{ border: '1px solid var(--main-color)', padding: '10px' }}>SIZE</th>
                        {selectedSizes.map((size) => (
                            <th key={size} style={{ border: '1px solid var(--main-color)', padding: '10px' }}>
                                {size}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={row.name}>
                            <td style={{ border: '1px solid var(--main-color)', padding: '10px' }}>{row.name}</td>
                            {selectedSizes.map((size) => (
                                <td key={`${row.name}-${size}`} style={{ border: '1px solid var(--main-color)', padding: '10px' }}>
                                    <input
                                        type="number"
                                        value={row.values[size] || ''}
                                        onChange={(e) => handleValueChange(rowIndex, size, e.target.value)}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            textAlign: 'center',
                                            outline: 'none',
                                        }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <Input
                    value={newRowName}
                    onChange={(e) => setNewRowName(e.target.value)}
                    outlined={true}
                    label='METRIC NAME'
                    style={{
                        flex: 1,
                        fontSize: '14px',
                        border: '1px solid #ccc',
                    }}
                />
                <Button onClick={handleAddRow}>
                    ADD A METRIC
                </Button>
            </div>
        </div>
    );
};

export default SizeChartTable;
