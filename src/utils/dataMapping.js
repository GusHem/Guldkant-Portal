// FILNAMN: src/utils/dataMapping.js
import { calculateTotal } from './helpers';

const mapAirtableStatusToInternal = (airtableStatus) => {
    const statusMap = {
        'Väntar Granskning': 'utkast',
        'Redo att skickas': 'förslag-skickat',
        'Accepterad': 'godkänd',
        'Nekad': 'förlorad'
    };
    return statusMap[airtableStatus] || airtableStatus?.toLowerCase() || 'arkiverad';
};

const mapInternalStatusToAirtable = (internalStatus) => {
    const statusMap = {
        'utkast': 'utkast',
        'förslag-skickat': 'Redo att skickas',
        'godkänd': 'Accepterad',
        'förlorad': 'Nekad',
        'genomförd': 'Genomförd',
        'betald': 'Betald',
        'arkiverad': 'Arkiverad'
    };
    return statusMap[internalStatus] || 'utkast';
};

export const mapAirtableToInternalQuote = (airtableQuote) => {
    const internalQuote = {
        id: airtableQuote.id,
        rawId: airtableQuote.rawId,
        customer: airtableQuote.kundNamn || 'Okänd Kund',
        contactPerson: airtableQuote.kontaktPerson || '',
        contactEmail: airtableQuote.email || '',
        contactPhone: airtableQuote.telefon || '',
        customerType: ['Bröllop', 'Privat fest', 'Jubileum', 'Födelsedagsfest'].includes(airtableQuote.projektTyp) ? 'privat' : 'foretag',
        eventDate: airtableQuote.eventDatum || new Date().toISOString().split('T')[0],
        guestCount: airtableQuote.guestCount || 0,
        pricePerGuest: (airtableQuote.guestCount && airtableQuote.totalPris) ? airtableQuote.totalPris / airtableQuote.guestCount : 0,
        status: mapAirtableStatusToInternal(airtableQuote.status),
        eventStartTime: airtableQuote.eventTid || '',
        eventEndTime: '',
        menuDescription: airtableQuote.menuPreference || '',
        customerRequests: `Event Plats: ${airtableQuote.eventPlats || 'Ej specificerat'}\nÖvriga önskemål: ${airtableQuote.otherRequests || 'Inga'}`,
        internalComment: '',
        lastUpdated: airtableQuote.lastUpdated,
        events: [{ timestamp: airtableQuote.skapad, event: 'Ärende skapat från Airtable' }],
        customCosts: [],
        customDiets: airtableQuote.dietaryNeeds ? [{id: Date.now(), type: airtableQuote.dietaryNeeds, count: ''}] : [],
        chefCost: 0,
        servingStaffCost: 0,
        discountAmount: 0,
    };
    return { ...internalQuote, total: calculateTotal(internalQuote) };
};

export const mapInternalToAirtablePayload = (internalQuote) => {
    const payload = {
        rawId: internalQuote.rawId,
        kundNamn: internalQuote.customer,
        kontaktPerson: internalQuote.contactPerson,
        email: internalQuote.contactEmail,
        telefon: internalQuote.contactPhone,
        eventDatum: internalQuote.eventDate,
        guestCount: internalQuote.guestCount,
        status: mapInternalStatusToAirtable(internalQuote.status),
        eventTid: internalQuote.eventStartTime,
        menuPreference: internalQuote.menuDescription,
        otherRequests: internalQuote.customerRequests,
    };
    if (!payload.rawId) {
        delete payload.rawId;
    }
    return payload;
};