import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchProductByHandle } from '../utils/shopify';
import Button from '../shared/UI/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { VscChromeClose } from "react-icons/vsc";
import { CartContext } from '../contexts/CartContext';
import { Fade, Slide } from '@mui/material';
import Loader from '../shared/UI/Loader';
import s from '../shared/ClothingItemScreen.module.scss';
import { IoMdClose } from "react-icons/io";

function ClothingItemScreen() {
    const { handle } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const { addItemToCart, refreshCart, setIsBagOpened, isBagOpened } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [modelReference, setModelReference] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [addedItemPopUpShown, setAddedItemPopUpShown] = useState(false);
    const [addedItemDetails, setAddedItemDetails] = useState(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // For expanded overlay
    const [imagesExpanded, setImagesExpanded] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);

    // Refs to each expanded image (so we can scroll to the correct one)
    const expandedImageRefs = useRef([]);

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
        if (imagesExpanded) {
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                if (expandedIndex != null) {
                    expandedImageRefs.current[expandedIndex]?.scrollIntoView({
                        block: 'start',
                    });
                }
            }, 0);
        } else {
            document.body.style.overflow = '';
        }
    }, [imagesExpanded, expandedIndex]);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const productData = await fetchProductByHandle(handle);
                if (productData) {
                    setProduct(productData);

                    const modelMetafield = productData.metafields?.find(
                        (mf) => mf.key === 'modelReference'
                    );
                    if (modelMetafield) {
                        setModelReference(modelMetafield.value);
                    } else {
                        setModelReference('');
                    }
                } else {
                    // not found?? 
                }
            } catch (err) {
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

    function getOptionValue(variant, optionName) {
        return variant.selectedOptions.find(
            (opt) => opt.name.toLowerCase() === optionName.toLowerCase()
        )?.value;
    }

    const allVariants = product.variants?.edges.map((edge) => edge.node) || [];

    const uniqueColorMap = new Map();
    for (const variant of allVariants) {
        const colorVal = getOptionValue(variant, 'color');
        if (!colorVal) continue;
        if (!uniqueColorMap.has(colorVal.toLowerCase())) {
            uniqueColorMap.set(colorVal.toLowerCase(), colorVal);
        }
    }
    const uniqueColors = Array.from(uniqueColorMap.values());

    const allSizes = Array.from(
        new Set(
            allVariants
                .map((v) => getOptionValue(v, 'size')?.toLowerCase() || null)
                .filter(Boolean)
        )
    );

    let currentVariant = null;
    if (selectedColor) {
        currentVariant = allVariants.find(
            (variant) =>
                getOptionValue(variant, 'color')?.toLowerCase() === selectedColor.toLowerCase()
        );
    }

    const variantImageUrl = currentVariant?.image?.url || '';

    const hasVariants = allVariants.length > 0;
    const imagesToDisplay = hasVariants
        ? product.images?.edges.slice(1, -1)
        : product.images?.edges;

    const expandedImages = [
        variantImageUrl,
        ...(imagesToDisplay?.map((img) => img.node.url) || []),
    ].filter(Boolean); 

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        const selectedVariant = allVariants.find(
            (variant) =>
                getOptionValue(variant, 'color')?.toLowerCase() === color.toLowerCase()
        );
        if (selectedVariant) {
            const numericId = selectedVariant.id.split('/').pop();
            setSearchParams({ variant: numericId });
        }
    };

    function handleImageClick(index) {
        setExpandedIndex(index);
        setImagesExpanded(true);
    }

    function handleCloseExpanded() {
        setImagesExpanded(false);
        setExpandedIndex(null);
    }

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
                getOptionValue(variant, 'color')?.toLowerCase() === selectedColor.toLowerCase() &&
                getOptionValue(variant, 'size')?.toLowerCase() === selectedSize.toLowerCase()
        );

        if (!matchedVariant) {
            alert('Selected combination is unavailable.');
            return;
        }

        try {
            await addItemToCart(matchedVariant.id, 1);
            await refreshCart();
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
            alert('Failed to add item to bag. Please try again.');
        }
    }

    return (
        <div className={s.container}>
            <Fade in={imagesExpanded}>
                <div
                    style={{
                        zIndex: 102,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'var(--main-bg-color)',
                        overflowY: 'auto',
                    }}
                >
                        <IoMdClose onClick={handleCloseExpanded} style={{position: 'fixed', padding: '1.25rem', cursor: 'pointer', top: 0, right: 0,}} size={isSmallScreen ? 24 : 32}/>
                    <div
                        style={{
                            zIndex: 103,
                            margin: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                        }}
                    >
                        {expandedImages.map((url, i) => (
                            <img
                                key={url}
                                ref={(el) => (expandedImageRefs.current[i] = el)}
                                src={url}
                                alt={`Expanded ${i}`}
                                style={{
                                    cursor: 'zoom-out',
                                    margin: 'auto',
                                    width: '100vw',
                                }}
                                onClick={handleCloseExpanded}
                            />
                        ))}
                    </div>
                </div>
            </Fade>

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
                                {addedItemDetails?.name?.toUpperCase()}
                            </p>
                            <p className={s.addedItemVariant}>
                                {addedItemDetails?.variantName?.toUpperCase()}
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

            {/* BACK TO SHOP */}
            <div className={s.backToShop} onClick={() => navigate('/products/all')}>
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
                                style={{ cursor: 'zoom-in' }}
                                onClick={() => handleImageClick(0)} 
                            />
                        )}
                        {imagesToDisplay?.map(({ node }, i) => (
                            <img
                                key={node.url}
                                src={node.url}
                                alt={product.title}
                                className={s.productImage}
                                style={{ cursor: 'zoom-in' }}
                                onClick={() => {
                                    handleImageClick(i + 1);
                                }}
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

                                {allSizes.length > 0 && (
                                    <div className={s.sizeSelectorContainer}>
                                        <div className={s.sizeButtonsContainer}>
                                            {allSizes.map((sz) => (
                                                <button
                                                    key={sz}
                                                    style={{color: 'var(--main-color)'}}
                                                    onClick={() => setSelectedSize(sz)}
                                                    className={`${s.sizeButton} ${
                                                        selectedSize === sz ? s.selectedSize : ''
                                                    }`}
                                                >
                                                    {sz.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {modelReference ? (
                                    <p>{modelReference.toUpperCase()}</p>
                                ) : null}

                                <div className={s.colorSelectorContainer}>
                                    <div className={s.colorVariants}>
                                        {uniqueColors.map((color) => {
                                            const isActive =
                                                selectedColor.toLowerCase() === color.toLowerCase();

                                            const variantWithColor = allVariants.find(
                                                (variant) =>
                                                    getOptionValue(variant, 'color')?.toLowerCase() ===
                                                    color.toLowerCase()
                                            );

                                            return (
                                                <div
                                                    key={color}
                                                    className={s.colorOption}
                                                >
                                                    {variantWithColor?.image?.url ? (
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
                                        {selectedColor
                                            ? selectedColor.toUpperCase()
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* DESCRIPTION & ACTION BUTTONS */}
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
                                            onClick={() => setIsBagOpened(true)}
                                        >
                                            CHECKOUT
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* For small screens, the ADD buttons appear at bottom */}
                    {isSmallScreen && (
                        <div className={s.actionButtons}>
                            <Button onClick={handleAddToBag}>
                                {selectedSize && selectedColor
                                    ? 'ADD TO BAG'
                                    : 'SELECT A SIZE'}
                            </Button>
                            <Button
                                secondary
                                onClick={() => setIsBagOpened(true)}
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
