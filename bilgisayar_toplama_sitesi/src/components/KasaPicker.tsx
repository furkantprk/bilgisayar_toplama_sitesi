
import React, { useMemo, useState } from 'react';
import type { Kasa, PSU, Anakart, EkranKarti } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface KasaPickerProps {
    kasalar: Kasa[];
    seciliAnakart: Anakart | null;
    seciliEkranKarti: EkranKarti | null;
    seciliPsu: PSU | null;
    seciliKasaId?: string | null;
    onKasaSelect: (kasa: Kasa) => void;
}

interface ListItemProps {
    item: Kasa; isSelected: boolean; isOutOfStock: boolean; isUyumlu: boolean; hasConflict: boolean;
    onSelect: (item: Kasa) => void; uyumsuzlukNedeni: string;
}
const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, isUyumlu, hasConflict, onSelect, uyumsuzlukNedeni }) => {
    let title: string | undefined = undefined;
    if (!isUyumlu) title = `Uyumsuz: ${uyumsuzlukNedeni.trim()}`;
    else if (hasConflict) title = "Bu kasanın kendi PSU'su var, önceki seçimi geçersiz kılabilir.";

    return (
        <li
            key={item.id}
            className={`
              ${isSelected ? 'selected' : ''}
              ${isOutOfStock ? 'out-of-stock' : ''}
              ${!isUyumlu ? 'incompatible' : ''}
              ${hasConflict ? 'conflict' : ''}
            `}
            title={title}
        >
            <span>
                {item.ad} ({item.form_factor}) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
                {isOutOfStock && <span className="stock-info">(Stokta Yok)</span>}
                {!isUyumlu && <span className="conflict-info">(Uyumsuz)</span>}
                {isUyumlu && hasConflict && <span className="conflict-info">(Tümleşik PSU Var!)</span>}
            </span>
            <button
                onClick={() => !(isOutOfStock || !isUyumlu || hasConflict) && onSelect(item)}
                disabled={isSelected || isOutOfStock || !isUyumlu || hasConflict}
            >
                {isSelected ? 'Seçildi' : 'Seç'}
            </button>
        </li>
    );
}

const KasaPicker: React.FC<KasaPickerProps> = ({ kasalar, seciliAnakart, seciliEkranKarti, seciliPsu, seciliKasaId, onKasaSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });

    const filterData = useMemo(() => {
        if (!kasalar || kasalar.length === 0) {
            return {
                availableBrands: [],
                maxPrice: 0,
                availableFeatures: []
            };
        }

        return {
            availableBrands: getUniqueBrands(kasalar),
            maxPrice: getMaxPrice(kasalar),
            availableFeatures: getUniqueFeatures(kasalar)
        };
    }, [kasalar]);

    const filteredKasalar = useMemo(() => {
        if (!kasalar || kasalar.length === 0) return [];

        const filtersToApply = {
            ...filters,
            maxPrice: filters.maxPrice || filterData.maxPrice
        };

        return filterParts(kasalar, filtersToApply);
    }, [kasalar, filters, filterData.maxPrice]);

    const { availableCompatible, outOfStockCompatible, incompatibleItems, conflictItems } = useMemo(() => {
        const availableCompatible: {kasa: Kasa; uyumsuzlukNedeni: string}[] = [];
        const outOfStockCompatible: {kasa: Kasa; uyumsuzlukNedeni: string}[] = [];
        const incompatibleItems: {kasa: Kasa; uyumsuzlukNedeni: string}[] = [];
        const conflictItems: {kasa: Kasa; uyumsuzlukNedeni: string}[] = [];

        if (seciliAnakart && seciliEkranKarti && seciliPsu && filteredKasalar) {
            filteredKasalar.forEach(kasa => {
                const isOutOfStock = kasa.stok.durum === 'out_of_stock';
                let isUyumlu = true;
                let uyumsuzlukNedeni = '';

                const anakartUyumlu = kasa.mobo_destek.includes(seciliAnakart.form_factor);
                if (!anakartUyumlu) { isUyumlu = false; uyumsuzlukNedeni += `Anakart (${seciliAnakart.form_factor}) sığmıyor. `; }

                const gpuUzunluk = seciliEkranKarti.boyut?.uzunluk_mm;
                if (typeof gpuUzunluk === 'number' && gpuUzunluk > kasa.gpu_uzunluk_max_mm) { isUyumlu = false; uyumsuzlukNedeni += `Ekran kartı (${gpuUzunluk}mm) çok uzun (Max: ${kasa.gpu_uzunluk_max_mm}mm). `; }

                if (!kasa.psu_tumlesik) {
                    const psuUyumlu = kasa.psu_destek.includes(seciliPsu.form_factor);
                    if (!psuUyumlu) { isUyumlu = false; uyumsuzlukNedeni += `PSU (${seciliPsu.form_factor}) sığmıyor. `; }
                }

                const hasIntegratedPsuConflict = !!(kasa.psu_tumlesik && seciliPsu);

                const item = { kasa, uyumsuzlukNedeni: uyumsuzlukNedeni.trim() };

                if (!isUyumlu) {
                    incompatibleItems.push(item);
                } else if (hasIntegratedPsuConflict) {
                    conflictItems.push(item);
                } else if (isOutOfStock) {
                    outOfStockCompatible.push(item);
                } else {
                    availableCompatible.push(item);
                }
            });
        }
        return { availableCompatible, outOfStockCompatible, incompatibleItems, conflictItems };
    }, [filteredKasalar, seciliAnakart, seciliEkranKarti, seciliPsu]);


    if (!seciliAnakart || !seciliEkranKarti || !seciliPsu) {
        return (
            <div className="picker-container">
                <h2>Kasa Seçimi</h2>
                <p>Lütfen önce Anakart, Ekran Kartı ve Güç Kaynağı seçin.</p>
            </div>
        );
    }

    return (
        <div className="picker-container">
            <h2>
                Kasa Seçimi
                {filteredKasalar && ` (${filteredKasalar.length} adet)`}
            </h2>
            {!kasalar || kasalar.length === 0 ? (
                <p>Kasa bulunamadı veya veri yüklenemedi.</p>
            ) : (
                <>
                    {/* Filtreleme ve Arama */}
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="Kasa ara... (örn: ATX)"
                    />
                    {/* Uyumlu ve Stokta */}
                    {availableCompatible.length > 0 && (
                        <ul>
                            {availableCompatible.map(({kasa}) => (
                                <RenderListItem
                                    key={kasa.id} item={kasa}
                                    isSelected={kasa.id === seciliKasaId}
                                    isOutOfStock={false} isUyumlu={true} hasConflict={false}
                                    onSelect={onKasaSelect} uyumsuzlukNedeni=""
                                />
                            ))}
                        </ul>
                    )}

                    {/* Uyumlu - Stokta Yok */}
                    {outOfStockCompatible.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Uyumlu - Stokta Yok</h3>
                            <ul>
                                {outOfStockCompatible.map(({kasa}) => (
                                    <RenderListItem
                                        key={kasa.id} item={kasa}
                                        isSelected={false} isOutOfStock={true} isUyumlu={true} hasConflict={false}
                                        onSelect={onKasaSelect} uyumsuzlukNedeni=""
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {/* Uyumlu - Tümleşik PSU Çakışması */}
                    {conflictItems.length > 0 && (
                        <>
                            <h3 className="section-header incompatible-header">Uyumlu - Tümleşik PSU Uyarısı</h3>
                            <ul>
                                {conflictItems.map(({kasa}) => (
                                    <RenderListItem
                                        key={kasa.id} item={kasa}
                                        isSelected={false} isOutOfStock={kasa.stok.durum === 'out_of_stock'} isUyumlu={true} hasConflict={true}
                                        onSelect={onKasaSelect} uyumsuzlukNedeni=""
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {/* Uyumsuz */}
                    {incompatibleItems.length > 0 && (
                        <>
                            <h3 className="section-header incompatible-header">Uyumsuz</h3>
                            <ul>
                                {incompatibleItems.map(({kasa, uyumsuzlukNedeni}) => (
                                    <RenderListItem
                                        key={kasa.id} item={kasa}
                                        isSelected={false} isOutOfStock={kasa.stok.durum === 'out_of_stock'} isUyumlu={false} hasConflict={false}
                                        onSelect={onKasaSelect} uyumsuzlukNedeni={uyumsuzlukNedeni}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {availableCompatible.length === 0 && outOfStockCompatible.length === 0 && incompatibleItems.length === 0 && conflictItems.length === 0 && (
                        <p>Listelenecek kasa bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default KasaPicker;