import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext, focusClasses } from '../../contexts/ThemeContext';
import { formatDate, calculateTotal } from '../../utils/helpers';
import useScriptLoader from '../../hooks/useScriptLoader';
import { Input, NumberInput, Textarea, Checkbox } from '../common/FormComponents.jsx';
import ModalSection from '../common/ModalSection.jsx';
import EventLog from '../common/EventLog.jsx';
import MicroCalendar from '../calendar/MicroCalendar.jsx';
import CustomTimePicker from '../calendar/CustomTimePicker.jsx';
import XIcon from '../icons/XIcon.jsx';
import TrashIcon from '../icons/TrashIcon.jsx';
import FilePdfIcon from '../icons/FilePdfIcon.jsx';
import CalendarIcon from '../icons/CalendarIcon.jsx';

const EditModal = ({ quote, isOpen, onClose, onSave, onCopy, showToast, onDelete, onSendProposal, onApproveProposal }) => {
    const { classes } = useContext(ThemeContext);
    const [formData, setFormData] = useState(null);
    const [isMicroCalendarOpen, setMicroCalendarOpen] = useState(false);
    const [isTimePickerOpen, setTimePickerOpen] = useState(false);
    const [timePickerTarget, setTimePickerTarget] = useState(null);
    const [openSections, setOpenSections] = useState({ info: true, menu: true, costs: false, diets: false, internal: false });
    const pdfLoadingStatus = useScriptLoader(['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js']);
    const [displayTotal, setDisplayTotal] = useState(0);

    const timeInputClasses = `w-full p-2 rounded ${classes.inputBg} ${classes.text} border ${classes.border} transition-colors cursor-pointer text-center shadow-sm ${focusClasses}`;

    useEffect(() => {
        if (quote) {
            const initialData = { ...quote, customCosts: quote.customCosts || [], customDiets: quote.customDiets || [] };
            setFormData(initialData);
            setDisplayTotal(calculateTotal(initialData));
            setOpenSections({ info: true, menu: true, costs: false, diets: false, internal: false });
        } else {
            setFormData(null);
        }
    }, [quote]);

    useEffect(() => {
        if (formData) {
            setDisplayTotal(calculateTotal(formData));
        }
    }, [formData]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNumericChange = e => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value === '' ? '' : parseFloat(value) }));
    };

    const handleDateChange = (newDate) => {
        setFormData(p => ({ ...p, eventDate: newDate.toISOString().split('T')[0] }));
        setMicroCalendarOpen(false);
    };

    const handleTimeChange = (newTime) => {
        if (timePickerTarget) {
            setFormData(p => ({ ...p, [timePickerTarget]: newTime }));
        }
    };

    const openTimePicker = (target) => {
        setTimePickerTarget(target);
        setTimePickerOpen(true);
    };

    const handleCustomCostChange = (id, field, value) => {
        setFormData(p => ({ ...p, customCosts: p.customCosts.map(c => c.id === id ? { ...c, [field]: value } : c) }));
    };
    const addCustomCost = () => {
        setFormData(p => ({ ...p, customCosts: [...(p.customCosts || []), { id: Date.now(), description: '', amount: '' }] }));
    };
    const removeCustomCost = (id) => {
        setFormData(p => ({ ...p, customCosts: p.customCosts.filter(c => c.id !== id) }));
    };

    const handleCustomDietChange = (id, field, value) => {
        setFormData(p => ({ ...p, customDiets: p.customDiets.map(d => d.id === id ? { ...d, [field]: value } : d) }));
    };
    const addCustomDiet = () => {
        setFormData(p => ({ ...p, customDiets: [...(p.customDiets || []), { id: Date.now(), type: '', count: '' }] }));
    };
    const removeCustomDiet = (id) => {
        setFormData(p => ({ ...p, customDiets: p.customDiets.filter(d => d.id !== id) }));
    };

    const handleExportPdf = async () => {
        if (pdfLoadingStatus !== 'ready') {
            showToast('PDF-verktyget är inte redo.', 'error');
            return;
        }
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const data = formData;
            const primaryColor = '#b5830d';
            const textColor = '#333333';
            const pageMargin = 15;
            const pageWidth = doc.internal.pageSize.getWidth();
            let currentY = 25;

            doc.setFont('times', 'bold');
            doc.setFontSize(28);
            doc.setTextColor(primaryColor);
            doc.text('GULDKANT', pageWidth / 2, currentY, { align: 'center' });
            currentY += 15;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(textColor);
            const infoCol1 = [`Kund: ${data?.customer || ''}`, `Mail/Tele: ${data?.contactEmail || ''}${data?.contactPhone ? ' / ' + data.contactPhone : ''}`, `Eventdatum: ${formatDate(data?.eventDate)}`];
            const infoCol2 = [`Offertnummer: ${data?.id}`, `Antal gäster: ${data?.guestCount || ''} personer`, `Tid: ${data?.eventStartTime || ''} - ${data?.eventEndTime || ''}`];
            doc.text(infoCol1, pageMargin, currentY);
            doc.text(infoCol2, pageWidth / 2 + 10, currentY);
            currentY += (infoCol1.length * 5) + 10;

            const drawSection = (title) => {
                if (currentY > 250) { doc.addPage(); currentY = 20; }
                doc.setDrawColor(primaryColor);
                doc.setLineWidth(0.5);
                doc.line(pageMargin, currentY, pageWidth - pageMargin, currentY);
                currentY += 6;
                doc.setFont('times', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(primaryColor);
                doc.text(title.toUpperCase(), pageMargin, currentY);
                currentY += 8;
            };

            drawSection('Meny');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(textColor);
            const menuLines = doc.splitTextToSize(data?.menuDescription || 'Ingen meny angiven.', pageWidth - (pageMargin * 2));
            doc.text(menuLines, pageMargin, currentY);
            currentY += menuLines.length * 5 + 10;

            drawSection('Priser');
            const priceBody = [];
            if (data?.pricePerGuest && data.guestCount) { priceBody.push(['Mat', `${data.pricePerGuest} kr x ${data.guestCount}p`, `${(data.pricePerGuest * data.guestCount).toLocaleString('sv-SE')} kr`]); }
            if (data?.chefCost) { priceBody.push(['Personal: Kockar', ``, `${(data.chefCost).toLocaleString('sv-SE')} kr`]); }
            if (data?.servingStaffCost) { priceBody.push(['Personal: Servis', ``, `${(data.servingStaffCost).toLocaleString('sv-SE')} kr`]); }
            (data?.customCosts || []).forEach(c => { if (c.description && c.amount) priceBody.push([c.description, '', `${Number(c.amount).toLocaleString('sv-SE')} kr`]); });
            doc.autoTable({ startY: currentY, head: [['Beskrivning', 'Detalj', 'Pris']], body: priceBody, theme: 'plain', styles: { font: 'helvetica', fontSize: 10, cellPadding: 1.5 }, headStyles: { fontStyle: 'bold', textColor: primaryColor, halign: 'left' }, columnStyles: { 2: { halign: 'right' } }, margin: { left: pageMargin } });
            currentY = doc.lastAutoTable.finalY + 5;

            const subTotal = (data?.guestCount * data.pricePerGuest || 0) + (data?.chefCost || 0) + (data?.servingStaffCost || 0) + (data?.customCosts || []).reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0);
            const discountedSubTotal = subTotal - (data?.discountAmount || 0);
            const vatAmount = discountedSubTotal * 0.12;
            const finalTotal = discountedSubTotal + vatAmount;
            const totalData = [['Delsumma:', `${subTotal.toLocaleString('sv-SE')} kr`]];
            if (data?.discountAmount > 0) { totalData.push(['Rabatt:', `-${data.discountAmount.toLocaleString('sv-SE')} kr`]); }
            totalData.push(['Moms (12%):', `${vatAmount.toLocaleString('sv-SE', { maximumFractionDigits: 2 })} kr`]);
            totalData.push(['Totalt att betala:', `${finalTotal.toLocaleString('sv-SE', { maximumFractionDigits: 2 })} kr`]);
            doc.autoTable({ startY: currentY, body: totalData, theme: 'plain', styles: { font: 'helvetica', fontSize: 10, cellPadding: 1.5 }, columnStyles: { 0: { fontStyle: 'bold', halign: 'right' }, 1: { halign: 'right' } }, margin: { left: pageWidth / 2 - pageMargin } });
            currentY = doc.lastAutoTable.finalY + 15;

            const finalInfo = `Offerten är giltig i 30 dagar. När vi är överens om innehåll skickar Guldkant en beställningsbekräftelse via mail som behöver ett godkännande från er sida.`;
            doc.setFontSize(9);
            doc.setTextColor(100);
            const infoLines = doc.splitTextToSize(finalInfo, pageWidth - (pageMargin * 2));
            doc.text(infoLines, pageMargin, currentY);

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                const pageWidthForWatermark = doc.internal.pageSize.getWidth();
                const pageHeightForWatermark = doc.internal.pageSize.getHeight();
                doc.saveGraphicsState();
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(110);
                doc.setTextColor(200, 200, 200);
                doc.setGState(new doc.GState({ opacity: 0.25 }));
                doc.text("OFFERT", pageWidthForWatermark / 2, pageHeightForWatermark / 2, { angle: -45, align: 'center' });
                doc.restoreGraphicsState();
                const footerY = doc.internal.pageSize.getHeight() - 10;
                doc.setDrawColor(primaryColor);
                doc.setLineWidth(0.2);
                doc.line(pageMargin, footerY - 12, pageWidth - pageMargin, footerY - 12);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text('Menyförslag av: Guldkant, camilla@restaurangguldkant.se / 0739-411422', pageMargin, footerY - 5);
                doc.text(`Sida ${i} av ${pageCount}`, pageWidth - pageMargin, footerY, { align: 'right' });
                doc.text('Restaurang Guldkant | org nr 556719-3635 | Grönsakstorget 6, 593 33 Västervik', pageMargin, footerY);
            }

            doc.save(`Offert-Guldkant-${data?.id}.pdf`);
            showToast('PDF-offert har skapats!', 'success');
        } catch (e) {
            showToast('Ett fel uppstod vid skapande av PDF.', 'error');
            console.error(e);
        }
    };

    const handleSave = () => {
        onSave(formData);
    };

    if (!isOpen || !formData) return null;

    return (
        <>
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${classes.modalOverlay}`} onClick={onClose}>
                <div onClick={e => e.stopPropagation()} className={`${classes.cardBg} w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col`}>
                    <header className={`p-4 border-b ${classes.border} flex justify-between items-center flex-shrink-0`}>
                        <h2 className="text-2xl font-bold">Redigera Ärende: <span className={classes.accent}>{formData?.id}</span></h2>
                        <button onClick={onClose} className={`p-2 rounded-full hover:bg-red-500/10 ${focusClasses}`}><XIcon className="w-6 h-6 hover:text-red-500" /></button>
                    </header>

                    <main className="p-6 overflow-y-auto flex-grow">
                        <ModalSection title="Kund & Event Information" isOpen={openSections.info} onToggle={() => setOpenSections(p => ({ ...p, info: !p.info }))}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Kundnamn" name="customer" value={formData?.customer || ''} onChange={handleChange} />
                                <div>
                                    <label className={`${classes.textSecondary} text-xs block mb-1`}>Kundtyp</label>
                                    <select name="customerType" value={formData?.customerType} onChange={handleChange} className={`w-full p-2 rounded ${classes.inputBg} ${classes.text} border ${classes.border} shadow-sm ${focusClasses}`}>
                                        <option value="privat">Privat</option><option value="foretag">Företag</option>
                                    </select>
                                </div>
                                <Input label="Kontaktperson" name="contactPerson" value={formData?.contactPerson || ''} onChange={handleChange} />
                                <Input label="Person-/Org.nummer" name="customerIdNumber" value={formData?.customerIdNumber || ''} onChange={handleChange} />
                                <Input label="E-post" name="contactEmail" type="email" value={formData?.contactEmail || ''} onChange={handleChange} />
                                <Input label="Telefon" name="contactPhone" type="tel" value={formData?.contactPhone || ''} onChange={handleChange} />
                                <div className="relative">
                                    <label className={`block text-xs font-medium ${classes.textSecondary} mb-1`}>Eventdatum</label>
                                    <div tabIndex="0" role="button" onKeyDown={e => e.key === 'Enter' && setMicroCalendarOpen(o => !o)} onClick={() => setMicroCalendarOpen(o => !o)} className={`w-full p-2 rounded-md border flex items-center justify-between cursor-pointer ${classes.inputBg} ${classes.border} ${focusClasses}`}>
                                        <span>{formatDate(formData?.eventDate)}</span>
                                        <CalendarIcon className={classes.textSecondary} />
                                    </div>
                                    {isMicroCalendarOpen && (<MicroCalendar selectedDate={formData?.eventDate} onDateSelect={handleDateChange} onClose={() => setMicroCalendarOpen(false)} />)}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`${classes.textSecondary} text-xs block mb-1`}>Starttid</label>
                                        <div tabIndex="0" role="button" onKeyDown={e => e.key === 'Enter' && openTimePicker('eventStartTime')} className={timeInputClasses} onClick={() => openTimePicker('eventStartTime')}>{formData?.eventStartTime || 'Välj tid'}</div>
                                    </div>
                                    <div>
                                        <label className={`${classes.textSecondary} text-xs block mb-1`}>Sluttid</label>
                                        <div tabIndex="0" role="button" onKeyDown={e => e.key === 'Enter' && openTimePicker('eventEndTime')} className={timeInputClasses} onClick={() => openTimePicker('eventEndTime')}>{formData?.eventEndTime || 'Välj tid'}</div>
                                    </div>
                                </div>
                                <NumberInput label="Antal gäster" name="guestCount" value={formData?.guestCount || ''} onChange={handleNumericChange} />
                                <NumberInput label="Pris per kuvert (SEK)" name="pricePerGuest" value={formData?.pricePerGuest || ''} onChange={handleNumericChange} />
                            </div>
                            <div className="mt-4"><Textarea label="Kundens önskemål" name="customerRequests" value={formData?.customerRequests || ''} onChange={handleChange} /></div>
                        </ModalSection>

                        <ModalSection title="Meny & Beskrivning" isOpen={openSections.menu} onToggle={() => setOpenSections(p => ({ ...p, menu: !p.menu }))}>
                            <Textarea label="Menybeskrivning" name="menuDescription" value={formData?.menuDescription || ''} onChange={handleChange} rows="4" />
                        </ModalSection>

                        <ModalSection title="Personal & Kostnader" isOpen={openSections.costs} onToggle={() => setOpenSections(p => ({ ...p, costs: !p.costs }))}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <NumberInput label="Antal kockar" name="numChefs" value={formData?.numChefs || ''} onChange={handleNumericChange} />
                                <NumberInput label="Kostnad Kockar" name="chefCost" value={formData?.chefCost || ''} onChange={handleNumericChange} />
                                <NumberInput label="Antal servitörer" name="numServingStaff" value={formData?.numServingStaff || ''} onChange={handleNumericChange} />
                                <NumberInput label="Kostnad Servitörer" name="servingStaffCost" value={formData?.servingStaffCost || ''} onChange={handleNumericChange} />
                            </div>
                            <div className="mt-6 space-y-3">
                                <label className={`${classes.textSecondary} text-xs block`}>Egna Kostnader</label>
                                {(!formData?.customCosts || formData.customCosts.length === 0) && <p className={`${classes.textSecondary} text-sm text-center py-2`}>Inga egna kostnader tillagda.</p>}
                                {(formData?.customCosts || []).map((cost) => (
                                    <div key={cost.id} className="flex items-start gap-2">
                                        <div className="flex-grow"><Input placeholder="Beskrivning" value={cost.description || ''} onChange={e => handleCustomCostChange(cost.id, 'description', e.target.value)} /></div>
                                        <div className="w-40"><NumberInput placeholder="Belopp" value={cost.amount || ''} onChange={e => handleCustomCostChange(cost.id, 'amount', e.target.value === '' ? '' : parseFloat(e.target.value))} /></div>
                                        <button onClick={() => removeCustomCost(cost.id)} className={`p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 mt-1 ${focusClasses}`}>-</button>
                                    </div>
                                ))}
                                <button onClick={addCustomCost} className={`${classes.buttonSecondaryBg} text-sm px-3 py-1 rounded ${focusClasses}`}>+ Lägg till kostnad</button>
                            </div>
                            <div className="mt-6"><NumberInput label="Rabatt (SEK)" name="discountAmount" value={formData?.discountAmount || ''} onChange={handleNumericChange} /></div>
                        </ModalSection>

                        <ModalSection title="Specialkost & Allergener" isOpen={openSections.diets} onToggle={() => setOpenSections(p => ({ ...p, diets: !p.diets }))}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <div className="flex items-center space-x-4"><Checkbox label="Vegetariskt" name="hasVegetarian" checked={!!formData?.hasVegetarian} onChange={handleChange} /><NumberInput label="Antal" name="numVegetarian" value={formData?.numVegetarian || ''} onChange={handleNumericChange} /></div>
                                <div className="flex items-center space-x-4"><Checkbox label="Veganskt" name="hasVegan" checked={!!formData?.hasVegan} onChange={handleChange} /><NumberInput label="Antal" name="numVegan" value={formData?.numVegan || ''} onChange={handleNumericChange} /></div>
                                <div className="flex items-center space-x-4"><Checkbox label="Glutenfritt" name="hasGlutenFree" checked={!!formData?.hasGlutenFree} onChange={handleChange} /><NumberInput label="Antal" name="numGlutenFree" value={formData?.numGlutenFree || ''} onChange={handleNumericChange} /></div>
                                <div className="flex items-center space-x-4"><Checkbox label="Laktosfritt" name="hasLactoseFree" checked={!!formData?.hasLactoseFree} onChange={handleChange} /><NumberInput label="Antal" name="numLactoseFree" value={formData?.numLactoseFree || ''} onChange={handleNumericChange} /></div>
                                <div className="flex items-center space-x-4"><Checkbox label="Nötallergi" name="hasNutAllergy" checked={!!formData?.hasNutAllergy} onChange={handleChange} /><NumberInput label="Antal" name="numNutAllergy" value={formData?.numNutAllergy || ''} onChange={handleNumericChange} /></div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <label className={`${classes.textSecondary} text-xs block`}>Anpassade Specialkoster</label>
                                {(!formData?.customDiets || formData.customDiets.length === 0) && <p className={`${classes.textSecondary} text-sm text-center py-2`}>Ingen annan specialkost tillagd.</p>}
                                {(formData?.customDiets || []).map((diet) => (
                                    <div key={diet.id} className="flex items-start gap-2">
                                        <div className="flex-grow"><Input placeholder="Typ (t.ex. 'Utan fisk')" value={diet.type || ''} onChange={e => handleCustomDietChange(diet.id, 'type', e.target.value)} /></div>
                                        <div className="w-40"><NumberInput placeholder="Antal" value={diet.count || ''} onChange={e => handleCustomDietChange(diet.id, 'count', e.target.value === '' ? '' : parseFloat(e.target.value))} /></div>
                                        <button onClick={() => removeCustomDiet(diet.id)} className={`p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 mt-1 ${focusClasses}`}>-</button>
                                    </div>
                                ))}
                                <button onClick={addCustomDiet} className={`${classes.buttonSecondaryBg} text-sm px-3 py-1 rounded ${focusClasses}`}>+ Lägg till specialkost</button>
                            </div>
                        </ModalSection>

                        <ModalSection title="Interna Noteringar & Händelselogg" isOpen={openSections.internal} onToggle={() => setOpenSections(p => ({ ...p, internal: !p.internal }))}>
                            <Textarea name="internalComment" value={formData?.internalComment || ''} onChange={handleChange} />
                            <h3 className={`mt-4 font-semibold ${classes.textSecondary}`}>Händelselogg</h3>
                            <EventLog events={formData?.events} />
                        </ModalSection>
                    </main>

                    <footer className={`p-4 border-t ${classes.border} flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => onDelete(formData)} className={`p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors ${focusClasses}`}><TrashIcon /></button>
                            <button onClick={() => onCopy(formData)} className={`${classes.accent} hover:text-cyan-500 text-sm font-semibold ${focusClasses}`}>Kopiera Ärende</button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <p className={`font-bold text-xl ${classes.accent}`}>{displayTotal.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</p>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={handleExportPdf} disabled={pdfLoadingStatus !== 'ready'} className={`w-full sm:w-auto ${classes.buttonSecondaryBg} ${classes.buttonSecondaryText} ${classes.buttonSecondaryHover} px-3 py-2 text-sm rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${focusClasses}`}><FilePdfIcon /> Exportera</button>
                                <button onClick={handleSave} className={`w-full sm:w-auto ${classes.buttonSecondaryBg} ${classes.buttonSecondaryText} ${classes.buttonSecondaryHover} px-5 py-2 rounded-lg font-semibold transition-colors shadow ${focusClasses}`}>Spara</button>
                            </div>
                            {formData?.status === 'utkast' && (<button onClick={() => onSendProposal(formData)} className={`w-full sm:w-auto ${classes.buttonPrimaryBg} ${classes.buttonPrimaryText} ${classes.buttonPrimaryHover} px-5 py-2 rounded-lg font-semibold transition-colors shadow ${focusClasses}`}>Skicka Förslag</button>)}
                            {formData?.status === 'förslag-skickat' && (<button onClick={() => onApproveProposal(formData)} className={`w-full sm:w-auto bg-green-500 text-white hover:bg-green-600 px-5 py-2 rounded-lg font-semibold transition-colors shadow ${focusClasses}`}>Godkänn Förslag</button>)}
                        </div>
                    </footer>
                </div>
            </div>
            <CustomTimePicker isOpen={isTimePickerOpen} onClose={() => setTimePickerOpen(false)} value={formData?.[timePickerTarget] || '12:00'} onChange={handleTimeChange} />
        </>
    );
};

export default EditModal;