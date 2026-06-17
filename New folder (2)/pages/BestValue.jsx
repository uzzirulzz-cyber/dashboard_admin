import React from 'react';
import Trending from './Trending'; // re-use Trending layout

export function BestValue() {
  // You can customize filter, sorting or pass props here
  // For example: filter products by discount > 20%

  return (
    <Trending
      filter={{ discountMin: 20 }}
      title="Best Value Deals"
      subtitle="Top discounted products on PlayBeat.digital"
    />
  );
}

export default BestValue;
