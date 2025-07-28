// FILNAMN: src/utils/helpers.js
export const formatDate = (dateString, options = { year: 'numeric', month: '2-digit', day: '2-digit' }) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date) ? '' : date.toLocaleDateString('sv-SE', options);
};

export const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('sv-SE');

export const calculateTotal = (quote) => {
    if (!quote) return 0;
    const base = (quote.guestCount || 0) * (quote.pricePerGuest || 0);
    const staff = (quote.chefCost || 0) + (quote.servingStaffCost || 0);
    const custom = (quote.customCosts || []).reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0);
    const subTotal = base + staff + custom;
    const discountedSubTotal = subTotal - (quote.discountAmount || 0);
    const vat = discountedSubTotal * 0.12;
    return discountedSubTotal + vat;
};

export const statusTextMap = {
    'utkast': 'Utkast',
    'förslag-skickat': 'Förslag Skickat',
    'godkänd': 'Godkänd',
    'genomförd': 'Genomförd',
    'betald': 'Betald',
    'förlorad': 'Förlorad Affär',
    'arkiverad': 'Arkiverad'
};

export const statusColors = {
    utkast: 'bg-yellow-500',
    'förslag-skickat': 'bg-blue-500',
    godkänd: 'bg-green-500',
    genomförd: 'bg-blue-700',
    betald: 'bg-purple-500',
    förlorad: 'bg-red-500',
    arkiverad: 'bg-gray-500'
};