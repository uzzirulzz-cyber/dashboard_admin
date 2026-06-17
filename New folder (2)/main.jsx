import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "https://xtra11111111.onrender.com/api";

export default function App() {
  const [page, setPageState] = useState({ name: "home", slug: null, data: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const setPage = useCallback((name, slug = null, data = null) => {
    setPageState({ name, slug, data });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setLoadingCategories(true);
    axios.get(`${API_BASE}/categories`)
      .then(res => setCategories(res.data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    let url = `${API_BASE}/products`;
    if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;

    axios.get(url)
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [searchQuery]);

  const renderPage = () => {
    switch (page.name) {
      case "home":
        return <HomePage setPage={setPage} categories={categories} products={products} loadingCategories={loadingCategories} loadingProducts={loadingProducts} searchQuery={searchQuery} />;
      case "category":
        return <CategoryPage category={page.slug} setPage={setPage} categories={categories} products={products} />;
      case "product":
        return <ProductPage product={page.data || products.find(p => p.slug === page.slug)} setPage={setPage} />;
      case "trending":
        return <TrendingPage setPage={setPage} products={products} />;
      case "cart":
        return <CartPage setPage={setPage} />;
      case "checkout":
        return <CheckoutPage setPage={setPage} />;
      case "order-success":
        return <OrderSuccessPage setPage={setPage} />;
      case "login":
        return <AuthPage mode="login" setPage={setPage} />;
      case "register":
        return <AuthPage mode="register" setPage={setPage} />;
      case "account":
        return <AccountPage setPage={setPage} />;
      default:
        return <HomePage setPage={setPage} categories={categories} products={products} loadingCategories={loadingCategories} loadingProducts={loadingProducts} searchQuery={searchQuery} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header currentPage={page.name} setPage={setPage} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main style={{ flex: 1 }}>
          {renderPage()}
        </main>
        <Footer setPage={setPage} />
      </div>
      <Toasts />
    </>
  );
}
