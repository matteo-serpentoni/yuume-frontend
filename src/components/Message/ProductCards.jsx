import React from "react";
import { motion } from "framer-motion";
import MessageChips from "./MessageChips";
import { formatPrice, truncateText, extractProductName } from "../../utils/messageHelpers";

const ProductCard = ({ product, index }) => {
    const {
        name,
        price,
        image,
        description,
        availability,
        url,
        brand,
        category
    } = product;

    const handleCardClick = () => {
        if (url) {
            window.open(url, "_blank");
        }
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
        if (url) {
            window.open(url, "_blank");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: 8,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
                cursor: url ? "pointer" : "default",
                minHeight: 70
            }}
            whileHover={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)"
            }}
            onClick={handleCardClick}
        >
            {/* Product Image */}
            <div style={{
                width: 60,
                height: 60,
                borderRadius: 6,
                overflow: "hidden",
                flexShrink: 0,
                background: "#f3f4f6"
            }}>
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                        onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML = `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:24px;">
                  📦
                </div>
              `;
                        }}
                    />
                ) : (
                    <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: 24
                    }}>
                        📦
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                minWidth: 0
            }}>
                {/* Product Name */}
                <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    lineHeight: 1.3
                }}>
                    {extractProductName(name) || "Prodotto"}
                </div>

                {/* Brand & Category */}
                {(brand || category) && (
                    <div style={{
                        fontSize: 11,
                        color: "#6b7280",
                        fontWeight: 500
                    }}>
                        {brand && category ? `${brand} • ${category}` : brand || category}
                    </div>
                )}

                {/* Description */}
                {description && (
                    <div style={{
                        fontSize: 12,
                        color: "#6b7280",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                    }}>
                        {truncateText(description, 120)}
                    </div>
                )}

                {/* Price & Action Row */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4
                }}>
                    {/* Price */}
                    <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#059669"
                    }}>
                        {formatPrice(price)}
                    </div>

                    {/* Availability */}
                    {availability && availability !== "unknown" && (
                        <div style={{
                            fontSize: 10,
                            color: availability === "disponibile" ? "#059669" : "#dc2626",
                            fontWeight: 600,
                            textTransform: "uppercase"
                        }}>
                            {availability}
                        </div>
                    )}

                    {/* Action Button */}
                    {url && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: "#6366f1",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                            onClick={handleButtonClick}
                        >
                            Vedi
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const ProductCards = ({ message, onChipClick }) => {
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
                gap: 8
            }}>
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id || index}
                        product={product}
                        index={index}
                    />
                ))}
            </div>

            <MessageChips chips={message.chips} onChipClick={onChipClick} />
        </>
    );
};

export default ProductCards;