import type { KioskCatalog } from './types';

export const MOCK_DATA: KioskCatalog = {
  categories: [
    { id: 'clothing', name: 'Clothing' },
    { id: 'mens_clothing', name: 'Men\'s Clothing', parentId: 'clothing' },
    { id: 'womens_clothing', name: 'Women\'s Clothing', parentId: 'clothing' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'accessories', name: 'Accessories' },
  ],
  products: [
    {
      id: 'cotton_tshirt',
      categoryId: 'mens_clothing',
      name: 'Men\'s Premium Cotton T-Shirt',
      description: 'Soft, breathable cotton t-shirt perfect for everyday wear.',
      price: { amount: 1999, currency: 'GBP' },
    },
    {
      id: 'mens_jeans',
      categoryId: 'mens_clothing',
      name: 'Men\'s Classic Denim Jeans',
      description: 'Timeless straight-leg jeans with comfortable fit.',
      price: { amount: 5999, currency: 'GBP' },
    },
    {
      id: 'mens_polo',
      categoryId: 'mens_clothing',
      name: 'Men\'s Casual Polo Shirt',
      description: 'Classic polo shirt with breathable fabric.',
      price: { amount: 2999, currency: 'GBP' },
    },
    {
      id: 'womens_blouse',
      categoryId: 'womens_clothing',
      name: 'Women\'s Silk Blouse',
      description: 'Elegant silk blouse perfect for work or casual outings.',
      price: { amount: 3999, currency: 'GBP' },
    },
    {
      id: 'womens_dress',
      categoryId: 'womens_clothing',
      name: 'Women\'s Summer Dress',
      description: 'Light and flowy summer dress with floral pattern.',
      price: { amount: 4999, currency: 'GBP' },
    },
    {
      id: 'wireless_headphones',
      categoryId: 'electronics',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation.',
      price: { amount: 8999, currency: 'GBP' },
    },
    {
      id: 'smartphone_case',
      categoryId: 'accessories',
      name: 'Protective Phone Case',
      description: 'Durable case with screen protection and grip.',
      price: { amount: 2499, currency: 'GBP' },
    },
    {
      id: 'ceramic_mug',
      categoryId: 'home',
      name: 'Ceramic Coffee Mug',
      description: 'Handcrafted ceramic mug perfect for your morning coffee.',
      price: { amount: 1499, currency: 'GBP' },
    },
    {
      id: 'leather_wallet',
      categoryId: 'accessories',
      name: 'Genuine Leather Wallet',
      description: 'Classic bifold wallet with multiple card slots.',
      price: { amount: 3999, currency: 'GBP' },
    },
  ],
  upgradeOffers: [], // Not used in retail context
  variantGroups: [
    {
      id: 'size_options',
      name: 'Size',
      max: 1,
      items: [
        { id: 'size_s', name: 'Small', price: { amount: -500, currency: 'GBP' } },
        { id: 'size_m', name: 'Medium', price: { amount: 0, currency: 'GBP' } },
        { id: 'size_l', name: 'Large', price: { amount: 500, currency: 'GBP' } },
        { id: 'size_xl', name: 'Extra Large', price: { amount: 1000, currency: 'GBP' } },
      ],
    },
    {
      id: 'color_options',
      name: 'Color',
      max: 1,
      items: [
        { id: 'color_white', name: 'White', price: { amount: 0, currency: 'GBP' } },
        { id: 'color_black', name: 'Black', price: { amount: 0, currency: 'GBP' } },
        { id: 'color_blue', name: 'Navy Blue', price: { amount: 200, currency: 'GBP' } },
        { id: 'color_red', name: 'Red', price: { amount: 200, currency: 'GBP' } },
        { id: 'color_green', name: 'Forest Green', price: { amount: 200, currency: 'GBP' } },
        { id: 'color_gray', name: 'Gray', price: { amount: 100, currency: 'GBP' } },
      ],
    },
    {
      id: 'material_options',
      name: 'Material',
      max: 1,
      items: [
        { id: 'material_cotton', name: '100% Cotton', price: { amount: 0, currency: 'GBP' } },
        { id: 'material_organic', name: 'Organic Cotton', price: { amount: 500, currency: 'GBP' } },
        { id: 'material_bamboo', name: 'Bamboo Blend', price: { amount: 800, currency: 'GBP' } },
      ],
    },
    {
      id: 'storage_options',
      name: 'Storage Capacity',
      max: 1,
      items: [
        { id: 'storage_64gb', name: '64GB', price: { amount: 0, currency: 'GBP' } },
        { id: 'storage_128gb', name: '128GB', price: { amount: 2000, currency: 'GBP' } },
        { id: 'storage_256gb', name: '256GB', price: { amount: 4000, currency: 'GBP' } },
        { id: 'storage_512gb', name: '512GB', price: { amount: 7000, currency: 'GBP' } },
      ],
    },
    {
      id: 'phone_compatibility',
      name: 'Phone Compatibility',
      max: 1,
      items: [
        { id: 'phone_iphone', name: 'iPhone Series', price: { amount: 0, currency: 'GBP' } },
        { id: 'phone_samsung', name: 'Samsung Galaxy', price: { amount: 0, currency: 'GBP' } },
        { id: 'phone_google', name: 'Google Pixel', price: { amount: 0, currency: 'GBP' } },
        { id: 'phone_universal', name: 'Universal Fit', price: { amount: 100, currency: 'GBP' } },
      ],
    },
    {
      id: 'leather_type',
      name: 'Leather Type',
      max: 1,
      items: [
        { id: 'leather_genuine', name: 'Genuine Leather', price: { amount: 0, currency: 'GBP' } },
        { id: 'leather_vegan', name: 'Vegan Leather', price: { amount: -500, currency: 'GBP' } },
        { id: 'leather_suede', name: 'Suede', price: { amount: 1000, currency: 'GBP' } },
      ],
    },
    {
      id: 'mug_customization',
      name: 'Customization',
      max: 3,
      items: [
        { id: 'mug_personalized', name: 'Personalized Text', price: { amount: 500, currency: 'GBP' } },
        { id: 'mug_logo', name: 'Custom Logo', price: { amount: 800, currency: 'GBP' } },
        { id: 'mug_pattern', name: 'Pattern Design', price: { amount: 300, currency: 'GBP' } },
      ],
    },
    {
      id: 'headphone_features',
      name: 'Additional Features',
      max: 2,
      items: [
        { id: 'headphone_wireless_charging', name: 'Wireless Charging Case', price: { amount: 1500, currency: 'GBP' } },
        { id: 'headphone_noise_cancelling', name: 'Active Noise Cancelling', price: { amount: 2000, currency: 'GBP' } },
        { id: 'headphone_transparency', name: 'Transparency Mode', price: { amount: 500, currency: 'GBP' } },
      ],
    },
  ],
};
