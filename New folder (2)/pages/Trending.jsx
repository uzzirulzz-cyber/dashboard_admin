import React from 'react';
import CategoryPage from './category/CategoryPage';

export function Trending() {
  return (
    <div>
      <CategoryPage
        category=""
        title="🔥 Trending Now"
        icon="🔥"
        description="The hottest products right now. Limited-time deals and bestsellers across all categories."
      />
    </div>
  );
}

export function BestValue() {
  return (
    <div>
      <CategoryPage
        category=""
        title="💎 Best Global Deals"
        icon="💎"
        description="Best value products available globally. Premium quality at unbeatable prices."
      />
    </div>
  );
}

export default Trending;
