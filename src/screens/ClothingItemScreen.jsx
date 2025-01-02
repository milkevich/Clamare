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
        return <Loader />;
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
                                    ${product?.priceRange?.minVariantPrice?.amount}
                                </p>

                                <div className={s.sizeSelectorContainer}>
                                    {allSizes.length > 0 && (
                                        <div className={s.sizeButtonsContainer}>
                                            {allSizes.map((sz, index) => (
                                                <button
                                                    key={sz}
                                                    onClick={() => setSelectedSize(sz)}
                                                    className={`${s.sizeButton} ${selectedSize === sz
                                                        ? s.selectedSize
                                                        : ''
                                                        }`}
                                                >
                                                    {sz.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className={s.colorSelectorContainer}>
                                    <div className={s.colorVariants}>
                                        {uniqueColors.map((color) => {
                                            const isActive =
                                                selectedColor.toLowerCase() ===
                                                color.toLowerCase();
                                            // Find a variant with this color to get its image
                                            const variantWithColor = allVariants.find(
                                                (variant) =>
                                                    getOptionValue(
                                                        variant,
                                                        'color'
                                                    ).toLowerCase() ===
                                                    color.toLowerCase()
                                            );

                                            return (
                                                <div
                                                    key={color}
                                                    className={s.colorOption}
                                                >
                                                    {variantWithColor &&
                                                        variantWithColor.image?.url ? (
                                                        <img
                                                            src={
                                                                variantWithColor.image
                                                                    .url
                                                            }
                                                            alt={`Color: ${color}`}
                                                            className={`${s.colorImage} ${isActive
                                                                ? s.activeColor
                                                                : ''
                                                                }`}
                                                            onClick={() =>
                                                                handleColorSelect(
                                                                    color
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <div
                                                            onClick={() =>
                                                                handleColorSelect(
                                                                    color
                                                                )
                                                            }
                                                            className={`${s.colorPlaceholder} ${isActive
                                                                ? s.activeColor
                                                                : ''
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
                                {!isSmallScreen &&

                                    <div className={s.actionButtons}>
                                        <Button onClick={handleAddToBag}>
                                            {selectedSize && selectedColor
                                                ? 'ADD TO BAG'
                                                : 'SELECT A SIZE'}
                                        </Button>
                                        <Button
                                            secondary={true}
                                            onClick={() => navigate('/checkout')} // Adjust the path as needed
                                        >
                                            CHECKOUT
                                        </Button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    {isSmallScreen &&
                        <div className={s.actionButtons}>
                            <Button onClick={handleAddToBag}>
                                {selectedSize && selectedColor
                                    ? 'ADD TO BAG'
                                    : 'SELECT A SIZE'}
                            </Button>
                            <Button
                                secondary={true}
                                onClick={() => navigate('/checkout')} // Adjust the path as needed
                            >
                                CHECKOUT
                            </Button>
                        </div>
                    }
                </div>
            </Fade>
        </div>
    );
}

export default ClothingItemScreen;
