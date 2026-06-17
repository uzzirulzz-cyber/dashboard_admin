import { useProductsStore } from './store';

function ProductsPage() {
  const { products, loading, error, fetchProducts } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <ProductList products={products} />;
}
