
import React, { useMemo, useState } from 'react';
import type { Fare } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';


interface FarePickerProps {
    fareler: Fare[];
    seciliFareId?: string | null;
    onFareSelect: (fare: Fare) => void;

}


interface ListItemProps {
    item: Fare;
    isSelected: boolean;
    isOutOfStock: boolean;
    onSelect: (item: Fare) => void;
}
const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, onSelect }) => {
    return (
        <li
            key={item.id}
            className={`
              ${isSelected ? 'selected' : ''}
              ${isOutOfStock ? 'out-of-stock' : ''}
              ${/* incompatible class'ı fare için yok */ ''}
            `}

        >
            <span>
                {item.ad} ({item.sensor}, {item.kablosuz ? 'Kablosuz' : 'Kablolu'}) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
                {isOutOfStock && <span className="stock-info">(Stokta Yok)</span>}
                {/* Uyumsuz mesajı fare için yok */}
            </span>
            <button

                onClick={() => !isOutOfStock && onSelect(item)}
                disabled={isSelected || isOutOfStock}
            >
                {isSelected ? 'Seçildi' : 'Seç'}
            </button>
        </li>
    );
}

const FarePicker: React.FC<FarePickerProps> = ({ fareler, seciliFareId, onFareSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!fareler || fareler.length === 0) {
            return { availableBrands: [], availableFeatures: [], maxPrice: 0 };
        }
        return {
            availableBrands: getUniqueBrands(fareler),
            availableFeatures: getUniqueFeatures(fareler),
            maxPrice: getMaxPrice(fareler)
        };
    }, [fareler]);


    const filteredFareler = useMemo(() => {
        if (!fareler || fareler.length === 0) return [];
        return filterParts(fareler, { ...filters, maxPrice: filters.maxPrice || filterData.maxPrice });
    }, [fareler, filters, filterData.maxPrice]);


    const { available, outOfStock } = useMemo(() => {
        const available: Fare[] = [];
        const outOfStock: Fare[] = [];
        filteredFareler.forEach(fare => {
            if (fare.stok.durum === 'out_of_stock') {
                outOfStock.push(fare);
            } else {
                available.push(fare);
            }
        });
        return { available, outOfStock };
    }, [filteredFareler]);

    return (
        <div className="picker-container">
            <h2>
                Fare Seçimi
                {filteredFareler && ` (${filteredFareler.length} adet)`}
            </h2>
            {!fareler || fareler.length === 0 ? (
                <p>Fare bulunamadı veya fare verisi yüklenemedi.</p>
            ) : (
                <>
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="Fare ara... (örn: Logitech)"
                    />
                    
                    {/* Stokta Olanlar */}
                    {available.length > 0 && (
                        <ul>
                            {available.map((fare) => (
                                <RenderListItem
                                    key={fare.id}
                                    item={fare}
                                    isSelected={fare.id === seciliFareId}
                                    isOutOfStock={false}
                                    onSelect={onFareSelect}
                                />
                            ))}
                        </ul>
                    )}

                    {/* Stokta Olmayanlar */}
                    {outOfStock.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Stokta Yok</h3>
                            <ul>
                                {outOfStock.map((fare) => (
                                    <RenderListItem
                                        key={fare.id}
                                        item={fare}
                                        isSelected={false}
                                        isOutOfStock={true}
                                        onSelect={onFareSelect}
                                    />
                                ))}
                            </ul>
                        </>
                    )}
                    {/* Uyumsuz grubu fare için yok */}
                    {available.length === 0 && outOfStock.length === 0 && (
                        <p>Listelenecek fare bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default FarePicker;