export const purchaseProduct = async (product, setProducts, setSellingProducts, removeItemFromCart) => {
    if (!product || !product._id) {
        alert('Invalid product. Please try again.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/products/${product._id}/sell`, {
            method: 'PUT',
        });

        if (!response.ok) throw new Error('Failed to confirm purchase.');

        const updatedProduct = await response.json();

        // Update the product lists
        if (setProducts) {
            setProducts((prev) =>
                prev.map((prod) =>
                    prod._id === updatedProduct._id ? { ...updatedProduct } : prod
                )
            );
        }

        if (setSellingProducts) {
            setSellingProducts((prev) =>
                prev.map((prod) =>
                    prod._id === updatedProduct._id ? { ...updatedProduct } : prod
                )
            );
        }

        if (removeItemFromCart) {
            removeItemFromCart(product._id);
        }

        alert(`Successfully purchased ${product.name} for ₹${product.price}`);
    } catch (error) {
        console.error('Error confirming purchase:', error);
        alert('Purchase failed. Please try again.');
    }
};
