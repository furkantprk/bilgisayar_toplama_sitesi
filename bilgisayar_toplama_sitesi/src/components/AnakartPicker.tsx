
import React, { useMemo, useState } from 'react';
import type { Anakart } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface AnakartPickerProps {
    anakartlar: Anakart[];
    seciliAnakartId?: string | null;
    onAnakartSelect: (anakart: Anakart) => void;
}


interface ListItemProps {
    item: Anakart;
    isSelected: boolean;
    isOutOfStock: boolean;
    onSelect: (item: Anakart) => void;
}
const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, onSelect }) => (
    <li
        key={item.id}
        className={`${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
    >
        <span>
            {item.ad} - {item.fiyat_try.toLocaleString('tr-TR')} TRY
            {isOutOfStock && <span className="stock-info">(Stokta Yok)</span>}
        </span>
        <button
            onClick={() => !isOutOfStock && onSelect(item)}
            disabled={isSelected || isOutOfStock}
        >
            {isSelected ? 'Seçildi' : 'Seç'}
        </button>
    </li>
);


const AnakartPicker: React.FC<AnakartPickerProps> = ({ anakartlar, seciliAnakartId, onAnakartSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!anakartlar || anakartlar.length === 0) {
            return {
                availableBrands: [],
                maxPrice: 0,
                availableFeatures: []
            };
        }

        return {
            availableBrands: getUniqueBrands(anakartlar),
            maxPrice: getMaxPrice(anakartlar),
            availableFeatures: getUniqueFeatures(anakartlar)
        };
    }, [anakartlar]);


    const filteredAnakartlar = useMemo(() => {
        if (!anakartlar || anakartlar.length === 0) return [];

        const filtersToApply = {
            ...filters,
            maxPrice: filters.maxPrice || filterData.maxPrice
        };

        return filterParts(anakartlar, filtersToApply);
    }, [anakartlar, filters, filterData.maxPrice]);


    const { available, outOfStock } = useMemo(() => {
        const available: Anakart[] = [];
        const outOfStock: Anakart[] = [];
        (filteredAnakartlar || []).forEach(anakart => {
            if (anakart.stok.durum === 'out_of_stock') {
                outOfStock.push(anakart);
            } else {
                available.push(anakart);
            }
        });
        return { available, outOfStock };
    }, [filteredAnakartlar]);

    return (
        <div className="picker-container">
            <h2>
                Anakart Seçimi
                {filteredAnakartlar && ` (${filteredAnakartlar.length} adet)`}
            </h2>
            {!anakartlar || anakartlar.length === 0 ? (
                <p>Anakart bulunamadı.</p>
            ) : (
                <>
                    {/* Filtreleme ve Arama */}
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="Anakart ara... (örn: MSI)"
                    />
                    {/* Stokta Olanlar */}
                    {available.length > 0 && (
                        <ul>
                            {available.map((anakart) => (
                                <RenderListItem
                                    key={anakart.id}
                                    item={anakart}
                                    isSelected={anakart.id === seciliAnakartId}
                                    isOutOfStock={false}
                                    onSelect={onAnakartSelect}
                                />
                            ))}
                        </ul>
                    )}

                    {/* Stokta Olmayanlar */}
                    {outOfStock.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Stokta Yok</h3>
                            <ul>
                                {outOfStock.map((anakart) => (
                                    <RenderListItem
                                        key={anakart.id}
                                        item={anakart}
                                        isSelected={false}
                                        isOutOfStock={true}
                                        onSelect={onAnakartSelect}
                                    />
                                ))}
                            </ul>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default AnakartPicker;