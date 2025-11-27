import { motion } from "framer-motion";
import AddToCartButton from "./AddToCartButton";

const handleAddToCartSuccess = (data) => console.log("Aggiunto!", data);
const handleAddToCartError = (error) => console.log("Errore!", error);

const ProductCard = ({ product, index, shopDomain }) => {
  const { variantId, name, price, image, availability, brand, category } =
    product;

  const extractProductName = (name) => {
    return name?.split("|")[0]?.trim() || name;
  };

  const formatPrice = (price) => {
    if (!price) return "";
    return price.toString().replace("€", "€");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "14px",
        background: "#ffffff", // White card
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        color: "#1f2937", // Dark text
        boxSizing: "border-box",
      }}
    >
      {/* Header con immagine e info */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {/* Product Image */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "10px",
            overflow: "hidden",
            flexShrink: 0,
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ fontSize: "24px" }}>🎁</div>
          )}
        </div>

        {/* Product Info */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {/* Product Name */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#111827", // Dark gray
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {extractProductName(name) || "Prodotto"}
          </div>

          {/* Brand & Category */}
          {(brand || category) && (
            <div
              style={{
                fontSize: "11px",
                color: "#6b7280", // Medium gray
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {brand && category ? `${brand} • ${category}` : brand || category}
            </div>
          )}
        </div>
      </div>

      {/* Footer con prezzo e bottone */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          marginTop: "2px",
        }}
      >
        {/* Price e disponibilità */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827", // Dark
              lineHeight: 1,
            }}
          >
            {formatPrice(price)}
          </div>
          {availability && (
            <div
              style={{
                fontSize: "10px",
                color:
                  availability === true || availability === "disponibile"
                    ? "#059669" // Green
                    : "#dc2626", // Red
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
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
              onSuccess={handleAddToCartSuccess}
              onError={handleAddToCartError}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProductCards = ({ message, onAddToCart, shopDomain }) => {
  const {
    products = [],
    title,
    message: displayMessage,
    total_count,
  } = message;

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div style={{ color: "white", fontSize: "14px" }}>
        Nessun prodotto trovato.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minWidth: "240px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <span style={{ fontSize: 16 }}>🛍️</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: "white" }}>
          {title ||
            `${products.length} prodotto${
              products.length > 1 ? "i" : ""
            } trovato${products.length > 1 ? "i" : ""}`}
        </span>
        {total_count && total_count !== products.length && (
          <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.7)" }}>
            (di {total_count})
          </span>
        )}
      </div>

      {/* Display Message */}
      {displayMessage && (
        <div
          style={{
            fontSize: 13,
            color: "white",
            marginBottom: 12,
            lineHeight: 1.4,
          }}
        >
          {displayMessage}
        </div>
      )}

      {/* Product Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
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
    </div>
  );
};

export default ProductCards;
