
import React, { useMemo, useState } from 'react';
import type { Islemci, Anakart } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface IslemciPickerProps {
    islemciler: Islemci[];
    seciliAnakart: Anakart | null;
    seciliIslemciId?: string | null;
    onIslemciSelect: (islemci: Islemci) => void;
}


interface ListItemProps {
    item: Islemci; isSelected: boolean; isOutOfStock: boolean; isUyumlu: boolean;
    onSelect: (item: Islemci) => void; seciliAnakart: Anakart | null;
}
const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, isUyumlu, onSelect, seciliAnakart }) => {
    let title: string | undefined = undefined;
    if (!isUyumlu && seciliAnakart) {
        title = `Uyumsuz: Seçili anakart ile soket, üretici veya nesil uyuşmuyor.`;
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
                {item.ad} - {item.fiyat_try.toLocaleString('tr-TR')} TRY
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

const IslemciPicker: React.FC<IslemciPickerProps> = ({ islemciler, seciliAnakart, seciliIslemciId, onIslemciSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!islemciler || islemciler.length === 0) {
            return {
                availableBrands: [],
                maxPrice: 0,
                availableFeatures: []
            };
        }

        return {
            availableBrands: getUniqueBrands(islemciler),
            maxPrice: getMaxPrice(islemciler),
            availableFeatures: getUniqueFeatures(islemciler)
        };
    }, [islemciler]);


    const filteredIslemciler = useMemo(() => {
        if (!islemciler || islemciler.length === 0) return [];

        const filtersToApply = {
            ...filters,
            maxPrice: filters.maxPrice || filterData.maxPrice
        };

        return filterParts(islemciler, filtersToApply);
    }, [islemciler, filters, filterData.maxPrice]);


    const { availableCompatible, outOfStockCompatible, incompatibleItems } = useMemo(() => {
        const availableCompatible: Islemci[] = [];
        const outOfStockCompatible: Islemci[] = [];
        const incompatibleItems: Islemci[] = [];

        if (seciliAnakart && filteredIslemciler) {
            filteredIslemciler.forEach(islemci => {
                const isOutOfStock = islemci.stok.durum === 'out_of_stock';
                const isUyumlu =
                    islemci.vendor === seciliAnakart.cpu_uyumluluk.vendor &&
                    islemci.soket === seciliAnakart.cpu_uyumluluk.socket &&
                    seciliAnakart.cpu_uyumluluk.nesiller.includes(islemci.nesil);

                if (isUyumlu) {
                    if (isOutOfStock) outOfStockCompatible.push(islemci);
                    else availableCompatible.push(islemci);
                } else {
                    incompatibleItems.push(islemci);
                }
            });
        }
        return { availableCompatible, outOfStockCompatible, incompatibleItems };
    }, [filteredIslemciler, seciliAnakart]);


    if (!seciliAnakart) {
        return (
            <div className="picker-container">
                <h2>İşlemci Seçimi</h2>
                <p>Lütfen önce uyumlu bir anakart seçin.</p>
            </div>
        );
    }

    return (
        <div className="picker-container">
            <h2>
                İşlemci Seçimi
                {filteredIslemciler && ` (${filteredIslemciler.length} adet)`}
            </h2>
            {!islemciler || islemciler.length === 0 ? (
                <p>İşlemci bulunamadı veya veri yüklenemedi.</p>
            ) : (
                <>
                    {/* Filtreleme ve Arama */}
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="İşlemci ara... (örn: Ryzen 7)"
                    />
                    {/* Uyumlu ve Stokta */}
                    {availableCompatible.length > 0 && (


                        <ul>
                            {availableCompatible.map(islemci => (
                                <RenderListItem
                                    key={islemci.id} item={islemci}
                                    isSelected={islemci.id === seciliIslemciId}
                                    isOutOfStock={false} isUyumlu={true}
                                    onSelect={onIslemciSelect} seciliAnakart={seciliAnakart}
                                />
                            ))}
                        </ul>
                    )}

                    {/* Uyumlu - Stokta Yok */}
                    {outOfStockCompatible.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Uyumlu - Stokta Yok</h3>
                            <ul>
                                {outOfStockCompatible.map(islemci => (
                                    <RenderListItem
                                        key={islemci.id} item={islemci}
                                        isSelected={false} isOutOfStock={true} isUyumlu={true}
                                        onSelect={onIslemciSelect} seciliAnakart={seciliAnakart}
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
                                {incompatibleItems.map(islemci => (
                                    <RenderListItem
                                        key={islemci.id} item={islemci}
                                        isSelected={false} isOutOfStock={islemci.stok.durum === 'out_of_stock'} isUyumlu={false}
                                        onSelect={onIslemciSelect} seciliAnakart={seciliAnakart}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {/* Hiçbir şey yoksa gösterilecek mesaj */}
                    {availableCompatible.length === 0 && outOfStockCompatible.length === 0 && incompatibleItems.length === 0 && (
                        <p>Listelenecek işlemci bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default IslemciPicker;