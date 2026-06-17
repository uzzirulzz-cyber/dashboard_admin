import React from 'react';
import CategoryPage from './CategoryPage';

export function Games() {
  return <CategoryPage category="games" title="Games" icon="🎮" description="Buy game keys, credits, and more. Steam, PSN, Xbox, Valorant, and 100+ platforms." />;
}

export function GiftCards() {
  return <CategoryPage category="gift-cards" title="Gift Cards" icon="🎁" description="Digital gift cards for all major platforms. Instant delivery worldwide." />;
}

export function Software() {
  return <CategoryPage category="software" title="Software" icon="💻" description="Genuine software licenses at the best prices. Adobe, Microsoft, Antivirus & more." />;
}

export function AiTools() {
  return <CategoryPage category="ai-tools" title="AI Tools" icon="🤖" description="ChatGPT, Midjourney, Claude, Gemini subscriptions and AI tool access." />;
}

export function GameItems() {
  return <CategoryPage category="game-items" title="Game Items" icon="⚔️ " description="Skins, bundles, in-game currency and items for top games." />;
}

export function Accounts() {
  return <CategoryPage category="accounts" title="Accounts" icon="👤" description="Premium pre-loaded accounts for streaming, gaming and more." />;
}

export function Subscriptions() {
  return <CategoryPage category="subscriptions" title="Subscriptions" icon="📺" description="Netflix, Spotify, Disney+, YouTube Premium and 50+ subscription services." />;
}

export function TopUp() {
  return <CategoryPage category="top-up" title="Top Up" icon="⚡" description="Mobile top-up, wallet credits and direct game top-ups worldwide." />;
}

export default Games;
