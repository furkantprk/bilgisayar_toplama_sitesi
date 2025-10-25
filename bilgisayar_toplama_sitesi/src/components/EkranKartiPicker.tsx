
import React, { useMemo, useState } from 'react';
import type { EkranKarti, Anakart } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface EkranKartiPickerProps {
    ekranKartlari: EkranKarti[];
    seciliAnakart: Anakart | null;
    seciliEkranKartiId?: string | null;
    onEkranKartiSelect: (ekranKarti: EkranKarti) => void;
}


interface ListItemProps {
    item: EkranKarti; isSelected: boolean; isOutOfStock: boolean; isUyumlu: boolean;
    onSelect: (item: EkranKarti) => void; seciliAnakart: Anakart | null;
}
const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, isUyumlu, onSelect, seciliAnakart }) => {
    let title: string | undefined = undefined;
    if (!isUyumlu && seciliAnakart) {
        title = `Uyumsuz: Seçili anakartta PCIe x16 yuvası bulunmuyor.`;
    }

    return (
        <li
            key={item.id}
            className={`
              ${isSelected ? 'selected' : ''}
              ${isOutOfStock ? 'out-of-stock' : ''}
              ${!isUyumlu ? 'incompatible' : ''}
            `}
            title={title}
        >
            <span>
                {item.ad} ({item.vram.boyut_gb}GB {item.vram.tip}) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
                {isOutOfStock && <span className="stock-info">(Stokta Yok)</span>}
                {!isUyumlu && <span className="conflict-info">(Uyumsuz)</span>}
            </span>
            <button
                onClick={() => !isOutOfStock && isUyumlu && onSelect(item)}
                disabled={isSelected || isOutOfStock || !isUyumlu}
            >
                {isSelected ? 'Seçildi' : 'Seç'}
            </button>
        </li>
    );
}

const EkranKartiPicker: React.FC<EkranKartiPickerProps> = ({ ekranKartlari, seciliAnakart, seciliEkranKartiId, onEkranKartiSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!ekranKartlari || ekranKartlari.length === 0) {
            return {
                availableBrands: [],
                maxPrice: 0,
                availableFeatures: []
            };
        }

        return {
            availableBrands: getUniqueBrands(ekranKartlari),
            maxPrice: getMaxPrice(ekranKartlari),
            availableFeatures: getUniqueFeatures(ekranKartlari)
        };
    }, [ekranKartlari]);


    const filteredEkranKartlari = useMemo(() => {
        if (!ekranKartlari || ekranKartlari.length === 0) return [];

        const filtersToApply = {
            ...filters,
            maxPrice: filters.maxPrice || filterData.maxPrice
        };

        return filterParts(ekranKartlari, filtersToApply);
    }, [ekranKartlari, filters, filterData.maxPrice]);


    const { availableCompatible, outOfStockCompatible, incompatibleItems } = useMemo(() => {
        const availableCompatible: EkranKarti[] = [];
        const outOfStockCompatible: EkranKarti[] = [];
        const incompatibleItems: EkranKarti[] = [];

        if (seciliAnakart && filteredEkranKartlari) {
            const hasPcieX16 = seciliAnakart.genisleme.pcie_x16 >= 1;

            filteredEkranKartlari.forEach(ek => {
                const isOutOfStock = ek.stok.durum === 'out_of_stock';
                const isUyumlu = hasPcieX16;

                if (isUyumlu) {
                    if (isOutOfStock) outOfStockCompatible.push(ek);
                    else availableCompatible.push(ek);
                } else {
                    incompatibleItems.push(ek);
                }
            });
        }
        return { availableCompatible, outOfStockCompatible, incompatibleItems };
    }, [filteredEkranKartlari, seciliAnakart]);


    if (!seciliAnakart) {
        return null;
    }

    return (
        <div className="picker-container">
            <h2>
                Ekran Kartı Seçimi
                {filteredEkranKartlari && ` (${filteredEkranKartlari.length} adet)`}
            </h2>
            {!ekranKartlari || ekranKartlari.length === 0 ? (
                <p>Ekran kartı bulunamadı veya veri yüklenemedi.</p>
            ) : (
                <>
                    {/* Filtreleme ve Arama */}
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="Ekran kartı ara... (örn: RTX)"
                    />
                    {/* Uyumlu ve Stokta */}
                    {availableCompatible.length > 0 && (
                        <ul>
                            {availableCompatible.map(ek => (
                                <RenderListItem
                                    key={ek.id} item={ek}
                                    isSelected={ek.id === seciliEkranKartiId}
                                    isOutOfStock={false} isUyumlu={true}
                                    onSelect={onEkranKartiSelect} seciliAnakart={seciliAnakart}
                                />
                            ))}
                        </ul>
                    )}

                    {/* Uyumlu - Stokta Yok */}
                    {outOfStockCompatible.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Uyumlu - Stokta Yok</h3>
                            <ul>
                                {outOfStockCompatible.map(ek => (
                                    <RenderListItem
                                        key={ek.id} item={ek}
                                        isSelected={false} isOutOfStock={true} isUyumlu={true}
                                        onSelect={onEkranKartiSelect} seciliAnakart={seciliAnakart}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {/* Uyumsuz */}
                    {incompatibleItems.length > 0 && (
                        <>
                            <h3 className="section-header incompatible-header">Uyumsuz (Anakartta x16 Yuvası Yok)</h3>
                            <ul>
                                {incompatibleItems.map(ek => (
                                    <RenderListItem
                                        key={ek.id} item={ek}
                                        isSelected={false} isOutOfStock={ek.stok.durum === 'out_of_stock'} isUyumlu={false}
                                        onSelect={onEkranKartiSelect} seciliAnakart={seciliAnakart}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {availableCompatible.length === 0 && outOfStockCompatible.length === 0 && incompatibleItems.length === 0 && (
                        <p>Listelenecek ekran kartı bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default EkranKartiPicker;