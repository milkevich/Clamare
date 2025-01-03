import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchProductByHandle } from '../utils/shopify';
import Button from '../shared/UI/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { VscChromeClose } from "react-icons/vsc";
import { CartContext } from '../contexts/CartContext';
import { Fade, Slide } from '@mui/material';
import Loader from '../shared/UI/Loader';
import s from '../shared/ClothingItemScreen.module.scss';

function ClothingItemScreen() {
    const { handle } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addItemToCart, refreshCart, setIsBagOpened, isBagOpened } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [modelReference, setModelReference] = useState('');  // <-- NEW state
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [addedItemPopUpShown, setAddedItemPopUpShown] = useState(false);
    const [addedItemDetails, setAddedItemDetails] = useState(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 600);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 1) Fetch product and Model Reference Metafield
    useEffect(() => {
        const loadProduct = async () => {
            try {
                const productData = await fetchProductByHandle(handle);
                if (productData) {
                    setProduct(productData);

                    // 2) Extract the modelReference metafield (if it exists)
                    // For 2023-07, 'metafields' returns an array, not edges.
                    const modelMetafield = productData.metafields?.find(
                        (mf) => mf.key === 'modelReference'
                    );
                    if (modelMetafield) {
                        setModelReference(modelMetafield.value);
                    } else {
                        setModelReference('');  // No metafield found
                    }
                } else {
                    // Product not found, you can handle it however you like:
                    // navigate('/products/all'); or show a "not found" message
                }
            } catch (err) {
                console.error('Error fetching product by handle:', err);
            }
        };
        loadProduct();
    }, [handle, navigate]);

    // 3) Handle variant from URL param
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
        return <Loader />;
    }

    // Function to get option value
    function getOptionValue(variant, optionName) {
        return variant.selectedOptions.find(
            (opt) => opt.name.toLowerCase() === optionName.toLowerCase()
        )?.value;
    }

    // Map out variants
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
                    getOptionValue(v, 'size') 
                      ? getOptionValue(v, 'size').toLowerCase() 
                      : null
                )
                .filter(Boolean)
        )
    );

    // Current variant based on color selection
    let currentVariant = null;
    if (selectedColor) {
        currentVariant = allVariants.find(
            (variant) =>
                getOptionValue(variant, 'color').toLowerCase() === selectedColor.toLowerCase()
        );
    }

    // Handle color selection
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        const selectedVariant = allVariants.find(
            (variant) =>
                getOptionValue(variant, 'color').toLowerCase() === color.toLowerCase()
        );
        if (selectedVariant) {
            const numericId = selectedVariant.id.split('/').pop();
            setSearchParams({ variant: numericId });
        }
    };

    // Determine which images to display
    const variantImageUrl = currentVariant?.image?.url || '';
    const hasVariants = allVariants.length > 0;
    const imagesToDisplay = hasVariants
        ? product.images?.edges.slice(1, -1)
        : product.images?.edges;

    // Add to Cart
    async function handleAddToBag() {
        if (!selectedSize) {
            alert('Please select a size.');
            return;
        }
        if (!selectedColor) {
            alert('Please select a color.');
            return;
        }
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
        <div className={s.container}>
            <Slide
                direction="left"
                in={addedItemPopUpShown && !isBagOpened}
                mountOnEnter
                unmountOnExit
            >
                <div
                    className={s.addedItemPopUp}
                    onClick={() => {
                        setIsBagOpened(true);
                        setAddedItemPopUpShown(false);
                    }}
                >
                    <div className={s.addedItemDetails}>
                        <img
                            src={addedItemDetails?.image}
                            alt={addedItemDetails?.variantName}
                            className={s.addedItemImage}
                        />
                        <div className={s.addedItemInfo}>
                            <p className={s.addedItemName}>
                                {addedItemDetails?.name.toUpperCase()}
                            </p>
                            <p className={s.addedItemVariant}>
                                {addedItemDetails?.variantName.toUpperCase()}
                            </p>
                            <p className={s.addedItemPrice}>
                                ${addedItemDetails?.price}
                            </p>
                        </div>
                    </div>
                    <p
                        className={s.closeButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setAddedItemPopUpShown(false);
                        }}
                    >
                        <VscChromeClose size={14} />
                    </p>
                </div>
            </Slide>

            <div
                className={s.backToShop}
                onClick={() => navigate('/products/all')}
            >
                <p className={s.backToShopText}>
                    <MdKeyboardArrowLeft size={14} /> BACK TO SHOP
                </p>
            </div>

            <Fade in={product}>
                <div className={s.mainContent}>
                    <div className={s.imageColumn}>
                        {variantImageUrl && (
                            <img
                                src={variantImageUrl}
                                alt="Current Color Variant"
                                className={s.productImage}
                            />
                        )}
                        {imagesToDisplay.map(({ node }) => (
                            <img
                                key={node.url}
                                src={node.url}
                                alt={product.title}
                                className={s.productImage}
                            />
                        ))}
                    </div>

                    <div className={s.infoContainer}>
                        <div className={s.infoContent}>
                            <div>
                                <p className={s.productTitle}>
                                    {product.title.toUpperCase()}
                                </p>
                                <p className={s.productPrice}>
                                    ${Math.floor(product?.priceRange?.minVariantPrice?.amount)}
                                </p>

                                <div style={{color: 'var(--main-color)'}} className={s.sizeSelectorContainer}>
                                    {allSizes.length > 0 && (
                                        <div style={{color: 'var(--main-color)'}} className={s.sizeButtonsContainer}>
                                            {allSizes.map((sz) => (
                                                <button
                                                    key={sz}
                                                    onClick={() => setSelectedSize(sz)}
                                                    className={`${s.sizeButton} ${
                                                        selectedSize === sz ? s.selectedSize : ''
                                                    }`}
                                                    style={{color: 'var(--main-color)'}}
                                                >
                                                    {sz.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* 4) Display the modelReference text if available */}
                                {modelReference ? (
                                    <p style={{}}>
                                        {modelReference.toUpperCase()}
                                    </p>
                                ) : (
                                    <p className={s.modelRefText}>
                                        {/* Fallback if no metafield is set */}
                                        MODEL REFERENCE NOT PROVIDED
                                    </p>
                                )}
                                
                                <div className={s.colorSelectorContainer}>
                                    <div className={s.colorVariants}>
                                        {uniqueColors.map((color) => {
                                            const isActive =
                                                selectedColor.toLowerCase() === color.toLowerCase();

                                            // Find a variant with this color to get its image
                                            const variantWithColor = allVariants.find(
                                                (variant) =>
                                                    getOptionValue(variant, 'color').toLowerCase() ===
                                                    color.toLowerCase()
                                            );

                                            return (
                                                <div
                                                    key={color}
                                                    className={s.colorOption}
                                                >
                                                    {variantWithColor && variantWithColor.image?.url ? (
                                                        <img
                                                            src={variantWithColor.image.url}
                                                            alt={`Color: ${color}`}
                                                            className={`${s.colorImage} ${
                                                                isActive ? s.activeColor : ''
                                                            }`}
                                                            onClick={() => handleColorSelect(color)}
                                                        />
                                                    ) : (
                                                        <div
                                                            onClick={() => handleColorSelect(color)}
                                                            className={`${s.colorPlaceholder} ${
                                                                isActive ? s.activeColor : ''
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className={s.selectedColorText}>
                                        {selectedColor.toUpperCase() || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Product Description and Buttons */}
                            <div className={s.productActions}>
                                <p className={s.productDescription}>
                                    {product.description}
                                </p>
                                {!isSmallScreen && (
                                    <div className={s.actionButtons}>
                                        <Button onClick={handleAddToBag}>
                                            {selectedSize && selectedColor
                                                ? 'ADD TO BAG'
                                                : 'SELECT A SIZE'}
                                        </Button>
                                        <Button
                                            secondary
                                            onClick={() => navigate('/checkout')} // Adjust path if needed
                                        >
                                            CHECKOUT
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isSmallScreen && (
                        <div className={s.actionButtons}>
                            <Button onClick={handleAddToBag}>
                                {selectedSize && selectedColor
                                    ? 'ADD TO BAG'
                                    : 'SELECT A SIZE'}
                            </Button>
                            <Button
                                secondary
                                onClick={() => navigate('/checkout')}
                            >
                                CHECKOUT
                            </Button>
                        </div>
                    )}
                </div>
            </Fade>
        </div>
    );
}

export default ClothingItemScreen;
