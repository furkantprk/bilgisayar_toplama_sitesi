
import React, { useMemo, useState } from 'react';
import type { Ram, Anakart } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface RamPickerProps {
    ramlar: Ram[];
    seciliAnakart: Anakart | null;
    seciliRamId?: string | null;
    onRamSelect: (ram: Ram) => void;
}


interface ListItemProps {
    item: Ram; isSelected: boolean; isOutOfStock: boolean; isUyumlu: boolean;
    onSelect: (item: Ram) => void; seciliAnakart: Anakart | null;
}
const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, isUyumlu, onSelect, seciliAnakart }) => {
    let title: string | undefined = undefined;
    if (!isUyumlu && seciliAnakart) {
        title = `Uyumsuz: Seçili anakart (${seciliAnakart.bellek.tip}, Max Hız: ${Math.max(...seciliAnakart.bellek.hiz_mhz)}MHz, Yuva: ${seciliAnakart.bellek.yuva_sayisi}) ile bellek tipi, hız veya yuva sayısı uyuşmuyor.`;
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
                {item.ad} ({item.kapasite_kit_gb}GB {item.tip} {item.hiz_mhz}MHz) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
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


const RamPicker: React.FC<RamPickerProps> = ({ ramlar, seciliAnakart, seciliRamId, onRamSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!ramlar || ramlar.length === 0) {
            return {
                availableBrands: [],
                maxPrice: 0,
                availableFeatures: []
            };
        }

        return {
            availableBrands: getUniqueBrands(ramlar),
            maxPrice: getMaxPrice(ramlar),
            availableFeatures: getUniqueFeatures(ramlar)
        };
    }, [ramlar]);


    const filteredRamlar = useMemo(() => {
        if (!ramlar || ramlar.length === 0) return [];

        const filtersToApply = {
            ...filters,
            maxPrice: filters.maxPrice || filterData.maxPrice
        };

        return filterParts(ramlar, filtersToApply);
    }, [ramlar, filters, filterData.maxPrice]);


    const { availableCompatible, outOfStockCompatible, incompatibleItems } = useMemo(() => {
        const availableCompatible: Ram[] = [];
        const outOfStockCompatible: Ram[] = [];
        const incompatibleItems: Ram[] = [];

        if (seciliAnakart && filteredRamlar) {
            const maxAnakartRamHizi = Math.max(...seciliAnakart.bellek.hiz_mhz);
            filteredRamlar.forEach(ram => {
                const isOutOfStock = ram.stok.durum === 'out_of_stock';
                const isUyumlu =
                    ram.tip === seciliAnakart.bellek.tip &&
                    ram.hiz_mhz <= maxAnakartRamHizi &&
                    ram.modul_sayisi <= seciliAnakart.bellek.yuva_sayisi;

                if (isUyumlu) {
                    if (isOutOfStock) outOfStockCompatible.push(ram);
                    else availableCompatible.push(ram);
                } else {
                    incompatibleItems.push(ram);
                }
            });
        }
        return { availableCompatible, outOfStockCompatible, incompatibleItems };
    }, [filteredRamlar, seciliAnakart]);


    if (!seciliAnakart) {
        return (
            <div className="picker-container">
                <h2>RAM Seçimi</h2>
                <p>Lütfen önce uyumlu bir anakart seçin.</p>
            </div>
        );
    }

    return (
        <div className="picker-container">
            <h2>
                RAM Seçimi
                {filteredRamlar && ` (${filteredRamlar.length} adet)`}
            </h2>
            {!ramlar || ramlar.length === 0 ? (
                <p>RAM bulunamadı veya veri yüklenemedi.</p>
            ) : (
                <>
                    {/* Filtreleme ve Arama */}
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="RAM ara... (örn: DDR5)"
                    />
                    {/* Uyumlu ve Stokta */}
                    {availableCompatible.length > 0 && (
                        <ul>
                            {availableCompatible.map(ram => (
                                <RenderListItem
                                    key={ram.id} item={ram}
                                    isSelected={ram.id === seciliRamId}
                                    isOutOfStock={false} isUyumlu={true}
                                    onSelect={onRamSelect} seciliAnakart={seciliAnakart}
                                />
                            ))}
                        </ul>
                    )}

                    {/* Uyumlu - Stokta Yok */}
                    {outOfStockCompatible.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Uyumlu - Stokta Yok</h3>
                            <ul>
                                {outOfStockCompatible.map(ram => (
                                    <RenderListItem
                                        key={ram.id} item={ram}
                                        isSelected={false} isOutOfStock={true} isUyumlu={true}
                                        onSelect={onRamSelect} seciliAnakart={seciliAnakart}
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
                                {incompatibleItems.map(ram => (
                                    <RenderListItem
                                        key={ram.id} item={ram}
                                        isSelected={false} isOutOfStock={ram.stok.durum === 'out_of_stock'} isUyumlu={false}
                                        onSelect={onRamSelect} seciliAnakart={seciliAnakart}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {/* Hiçbir şey yoksa */}
                    { availableCompatible.length === 0 && outOfStockCompatible.length === 0 && incompatibleItems.length === 0 && (
                        <p>Listelenecek RAM bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default RamPicker;