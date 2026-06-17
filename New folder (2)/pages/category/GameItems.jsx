import React from 'react';
import CategoryPage from './category/CategoryPage';

export default function GameItemsPage() {
  return (
    <CategoryPage
      category="game-items"
      title="⚔️ Game Items"
      icon="⚔️"
      description="Get your favorite in-game items and upgrades instantly."
    />
  );
}
