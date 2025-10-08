import { motion } from "framer-motion";
import MessageChips from "./MessageChips";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product, index, shopDomain }) => {
    const {
        variantId,
        name,
        price,
        image,
        availability,
        brand,
        category
    } = product;

    const extractProductName = (name) => {
        return name?.split('|')[0]?.trim() || name;
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return price.toString().replace('€', '€');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            style={{
                width: '100%',
                maxWidth: '100%',
                height: '110px',
                padding: '12px',
                border: 'none',
                borderRadius: '12px',
                background: '#fff',
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            {/* Header con immagine e info */}
            <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
            }}>
                {/* Product Image */}
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#f3f4f6'
                }}>
                    {image ? (
                        <img
                            src={image}
                            alt={name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                        }}>
                            🎁
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                }}>
                    {/* Product Name */}
                    <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111827',
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {extractProductName(name) || "Prodotto"}
                    </div>

                    {/* Brand & Category */}
                    {(brand || category) && (
                        <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {brand && category ? `${brand} • ${category}` : brand || category}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer con prezzo e bottone */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px'
            }}>
                {/* Price e disponibilità */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px'
                }}>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#059669',
                        lineHeight: 1
                    }}>
                        {formatPrice(price)}
                    </div>
                    {availability && (
                        <div style={{
                            fontSize: '9px',
                            color: availability === true || availability === "disponibile" ? '#059669' : '#dc2626',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                        }}>
                            {availability === true ? "DISPONIBILE" : availability}
                        </div>
                    )}
                </div>

                {/* Add to Cart Button */}
                {variantId && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <AddToCartButton
                            variantId={variantId}
                            shopDomain={shopDomain}
                            quantity={1}
                            onSuccess={(data) => console.log('Aggiunto!', data)}
                            onError={(error) => console.log('Errore!', error)}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ProductCards = ({ message, onChipClick, onAddToCart, shopDomain }) => {
    const { products = [], title, message: displayMessage, total_count } = message;

    if (!Array.isArray(products) || products.length === 0) {
        return (
            <>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8
                }}>
                    <span>🛍️</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {title || "Prodotti"}
                    </span>
                </div>
                <div style={{
                    color: "#6b7280",
                    fontSize: 12,
                    marginBottom: 12
                }}>
                    {displayMessage || "Nessun prodotto trovato."}
                </div>
                <MessageChips chips={message.chips} onChipClick={onChipClick} />
            </>
        );
    }

    return (
        <>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: "1px solid #f3f4f6"
            }}>
                <span style={{ fontSize: 16 }}>🛍️</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {title || `${products.length} prodotto${products.length > 1 ? "i" : ""} trovato${products.length > 1 ? "i" : ""}`}
                </span>
                {total_count && total_count !== products.length && (
                    <span style={{ fontSize: 11, color: "#6b7280" }}>
                        (di {total_count} totali)
                    </span>
                )}
            </div>

            {/* Display Message */}
            {displayMessage && (
                <div style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 12,
                    lineHeight: 1.4
                }}>
                    {displayMessage}
                </div>
            )}

            {/* Product Cards */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 10
            }}>
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id || index}
                        product={product}
                        index={index}
                        onAddToCart={onAddToCart}
                        shopDomain={shopDomain}
                    />
                ))}
            </div>

            <MessageChips chips={message.chips} onChipClick={onChipClick} />
        </>
    );
};

export default ProductCards;