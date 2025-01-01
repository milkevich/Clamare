import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchProductByHandle } from '../utils/shopify';
import Button from '../shared/UI/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { VscChromeClose } from "react-icons/vsc";
import { CartContext } from '../contexts/CartContext';
import { Fade, Slide } from '@mui/material';
import Loader from '../shared/UI/Loader'


function ClothingItemScreen() {
    const { handle } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addItemToCart, refreshCart, setIsBagOpened, isBagOpened } = useContext(CartContext);
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [addedItemPopUpShown, setAddedItemPopUpShown] = useState(false);
    const [addedItemDetails, setAddedItemDetails] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const productData = await fetchProductByHandle(handle);
                setProduct(productData);
            } catch (err) {
                console.error('Error fetching product by handle:', err);
            }
        };
        loadProduct();
    }, [handle]);

    useEffect(() => {
        const variantNumericId = searchParams.get('variant');
        if (variantNumericId && product) {
            const shopifyVariantGid = `gid://shopify/ProductVariant/${variantNumericId}`;
            const thisVariant = product.variants?.edges.find(
                (edge) => edge.node.id === shopifyVariantGid
            )?.node;

            if (thisVariant) {
                const colorOption = thisVariant.selectedOptions.find(
                    (opt) => opt.name.toLowerCase() === 'color'
                )?.value;
                if (colorOption) {
                    setSelectedColor(colorOption);
                }
            }
        }
    }, [searchParams, product]);

    if (!product) {
        return <Loader/>;
    }

    // Function to get option value
    function getOptionValue(variant, optionName) {
        return variant.selectedOptions.find(
            (opt) => opt.name.toLowerCase() === optionName.toLowerCase()
        )?.value;
    }

    const allVariants = product.variants?.edges.map((edge) => edge.node) || [];

    // Deduplicate color options
    const uniqueColorMap = new Map();
    for (const variant of allVariants) {
        const colorVal = getOptionValue(variant, 'color');
        if (!colorVal) continue;
        if (!uniqueColorMap.has(colorVal.toLowerCase())) {
            uniqueColorMap.set(colorVal.toLowerCase(), colorVal);
        }
    }

    const uniqueColors = Array.from(uniqueColorMap.values());

    // Extract all sizes
    const allSizes = Array.from(
        new Set(
            allVariants
                .map((v) =>
                    getOptionValue(v, 'size') ? getOptionValue(v, 'size').toLowerCase() : null
                )
                .filter(Boolean)
        )
    );

    // Find the currently selected variant based on color
    let currentVariant = null;
    if (selectedColor) {
        currentVariant = allVariants.find(
            (variant) =>
                getOptionValue(variant, 'color').toLowerCase() === selectedColor.toLowerCase()
        );
    }

    // Function to handle color selection
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        // Update the URL search params to reflect the selected variant
        const selectedVariant = allVariants.find(
            (variant) =>
                getOptionValue(variant, 'color').toLowerCase() === color.toLowerCase()
        );
        if (selectedVariant) {
            const numericId = selectedVariant.id.split('/').pop();
            setSearchParams({ variant: numericId });
        }
    };

    const variantImageUrl = currentVariant?.image?.url || '';

    const hasVariants = allVariants.length > 0;
    const imagesToDisplay = hasVariants
        ? product.images?.edges.slice(1, -1)
        : product.images?.edges;

    // Function to handle adding to cart
    async function handleAddToBag() {
        if (!selectedSize) {
            alert('Please select a size.');
            return;
        }
        if (!selectedColor) {
            alert('Please select a color.');
            return;
        }
        // Find the variant that matches both selected color and size
        const matchedVariant = allVariants.find(
            (variant) =>
                getOptionValue(variant, 'color').toLowerCase() === selectedColor.toLowerCase() &&
                getOptionValue(variant, 'size').toLowerCase() === selectedSize.toLowerCase()
        );

        if (!matchedVariant) {
            alert('Selected combination is unavailable.');
            return;
        }

        try {
            console.log('Attempting to add item to cart:', matchedVariant.id, 1);
            await addItemToCart(matchedVariant.id, 1);
            await refreshCart();
            console.log('Item successfully added to cart.');
            // Set the added item details for the pop-up
            setAddedItemDetails({
                image: matchedVariant.image?.url || '',
                name: product.title,
                variantName: matchedVariant.title,
                size: selectedSize.toUpperCase(),
                price: product?.priceRange?.minVariantPrice?.amount || '0.00',
            });
            setAddedItemPopUpShown(true);
            setTimeout(() => {
                setAddedItemPopUpShown(false);
            }, 3000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to bag. Please try again.');
        }
    }

    return (
        <div>
            <Slide direction="left" in={addedItemPopUpShown && !isBagOpened} mountOnEnter unmountOnExit>
                <div
                    style={{
                        position: 'fixed',
                        top: '100px',
                        right: '20px',
                        maxWidth: '300px',
                        width: '100%',
                        padding: '15px 25px 15px 15px',
                        backgroundColor: 'var(--main-bg-color)',
                        border: '1px solid var(--main-color)',
                        fontWeight: '580',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        zIndex: 101
                    }}

                    onClick={() => {
                        setIsBagOpened(true)
                        setAddedItemPopUpShown(false)
                    }}
                >
                    <div style={{display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
                        <img
                            src={addedItemDetails?.image}
                            alt={addedItemDetails?.variantName}
                            style={{ width: '60px' }}
                        />
                        <div>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '12px' }}>{addedItemDetails?.name.toUpperCase()}</p>
                            <p style={{ margin: '4px 0', fontWeight: '580', fontSize: '12px' }}>
                                {addedItemDetails?.variantName.toUpperCase()}
                            </p>
                            <p style={{ margin: 0, fontWeight: '580', fontSize: '12px' }}>
                                ${addedItemDetails?.price}
                            </p>
                        </div>
                    </div>
                    <p onClick={() => setSuccessPopUpShown(false)} style={{ margin: 0, cursor: 'pointer', width: '70%', textAlign: 'right' }}>
                        <VscChromeClose size={14} />
                    </p>
                </div>
            </Slide>
            <div
                onClick={() => navigate('/products/all')}
                style={{
                    borderBottom: '1px solid var(--border-color)',
                    padding: '10px',
                    cursor: 'pointer',
                    position: 'sticky',
                    top: 53,
                    backgroundColor: 'var(--main-bg-color)',
                    zIndex: 10,
                }}
            >
                <p
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '10px',
                        fontWeight: '580',
                        margin: 'auto',
                        marginTop: '0px',
                        maxWidth: '1300px',
                    }}
                >
                    <MdKeyboardArrowLeft size={14} /> BACK TO SHOP
                </p>
            </div>
                    <Fade in={product}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: '1300px',
                    margin: 'auto',
                    paddingBottom: '1.25rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center',
                        maxWidth: '500px',
                        width: '100%',
                    }}
                >
                    {variantImageUrl && (
                        <img
                            src={variantImageUrl}
                            alt="Current Color Variant"
                            style={{ maxWidth: '500px', width: '100%' }}
                        />
                    )}

                    {imagesToDisplay.map(({ node }) => (
                        <img
                            key={node.url}
                            src={node.url}
                            alt={product.title}
                            style={{ maxWidth: '500px', width: '100%' }}
                        />
                    ))}
                </div>

                <div
                    style={{
                        maxWidth: '600px',
                        fontSize: '12px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        maxHeight: 'calc(100vh - 90px)',
                        position: 'sticky',
                        top: 88,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        width: '100%',
                        padding: '0rem 1.5rem',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            maxHeight: '500px',
                            paddingBottom: '50px',
                        }}
                    >
                        <div>
                            <p style={{ fontWeight: '600', fontSize: '12px' }}>
                                {product.title.toUpperCase()}
                            </p>
                            <p>${product?.priceRange?.minVariantPrice?.amount}</p>

                            <div
                                style={{
                                    borderTop: '1px solid var(--border-color)',
                                    borderBottom: '1px solid var(--border-color)',
                                    padding: '0.75rem 0rem',
                                }}
                            >
                                {allSizes.length > 0 && (
                                    <div style={{ display: 'flex' }}>
                                        {allSizes.map((sz, index) => (
                                            <button
                                                key={sz}
                                                onClick={() => setSelectedSize(sz)}
                                                style={{
                                                    padding:
                                                        index === 0
                                                            ? '0.25rem 0.5rem 0.25rem 0rem'
                                                            : '0.25rem 0.5rem',
                                                    cursor: 'pointer',
                                                    border: 'none',
                                                    outline: 'none',
                                                    backgroundColor: 'var(--main-bg-color)',
                                                    fontWeight: selectedSize === sz ? '600' : '580',
                                                    textDecoration:
                                                        selectedSize === sz ? 'underline' : 'none',
                                                }}
                                            >
                                                {sz.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    borderBottom: '1px solid var(--border-color)',
                                    paddingTop: '0.5rem',
                                    paddingBottom: '1.5rem',
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: '580',
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    {selectedColor.toUpperCase() || 'N/A'}
                                </p>

                                {/* Color Variants Selector */}
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {uniqueColors.map((color) => {
                                        const isActive = selectedColor.toLowerCase() === color.toLowerCase();
                                        // Find a variant with this color to get its image
                                        const variantWithColor = allVariants.find(
                                            (variant) =>
                                                getOptionValue(variant, 'color').toLowerCase() === color.toLowerCase()
                                        );

                                        return (
                                            <div key={color} style={{ textAlign: 'center' }}>
                                                {variantWithColor && variantWithColor.image?.url ? (
                                                    <img
                                                        src={variantWithColor.image.url}
                                                        alt={`Color: ${color}`}
                                                        style={{
                                                            width: '50px',
                                                            cursor: 'pointer',
                                                            border: isActive
                                                                ? '1px solid var(--main-color)'
                                                                : '1px solid var(--border-color)',
                                                        }}
                                                        onClick={() => handleColorSelect(color)}
                                                    />
                                                ) : (
                                                    <div
                                                        onClick={() => handleColorSelect(color)}
                                                        style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            background: '#ccc',
                                                            display: 'inline-block',
                                                            cursor: 'pointer',
                                                            border: isActive
                                                                ? '1px solid var(--main-color)'
                                                                : '1px solid var(--border-color)',
                                                            borderRadius: '50%',
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Product Description and Buttons */}
                        <div>
                            <p>{product.description}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <Button onClick={handleAddToBag}>
                                    {selectedSize && selectedColor ? 'ADD TO BAG' : 'SELECT A SIZE'}
                                </Button>
                                <Button
                                    secondary={true}
                                    onClick={() => navigate('/checkout')} // Adjust the path as needed
                                >
                                    CHECKOUT
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </Fade>
        </div>
    );
}

export default ClothingItemScreen;
