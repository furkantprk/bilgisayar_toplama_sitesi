
import React, { useMemo, useState } from 'react';
import type { Klavye } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface KlavyePickerProps {
    klavyeler: Klavye[];
    seciliKlavyeId?: string | null;
    onKlavyeSelect: (klavye: Klavye) => void;

}


interface ListItemProps {
    item: Klavye;
    isSelected: boolean;
    isOutOfStock: boolean;
    onSelect: (item: Klavye) => void;
}
const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, onSelect }) => {
    return (
        <li
            key={item.id}
            className={`
              ${isSelected ? 'selected' : ''}
              ${isOutOfStock ? 'out-of-stock' : ''}
              ${/* incompatible class'ı klavye için yok */ ''}
            `}

        >
            <span>
                {item.ad} ({item.boyut}, {item.switch.tip}) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
                {isOutOfStock && <span className="stock-info">(Stokta Yok)</span>}
                {/* Uyumsuz mesajı klavye için yok */}
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

const KlavyePicker: React.FC<KlavyePickerProps> = ({ klavyeler, seciliKlavyeId, onKlavyeSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!klavyeler || klavyeler.length === 0) {
            return { availableBrands: [], availableFeatures: [], maxPrice: 0 };
        }
        return {
            availableBrands: getUniqueBrands(klavyeler),
            availableFeatures: getUniqueFeatures(klavyeler),
            maxPrice: getMaxPrice(klavyeler)
        };
    }, [klavyeler]);


    const filteredKlavyeler = useMemo(() => {
        if (!klavyeler || klavyeler.length === 0) return [];
        return filterParts(klavyeler, { ...filters, maxPrice: filters.maxPrice || filterData.maxPrice });
    }, [klavyeler, filters, filterData.maxPrice]);


    const { available, outOfStock } = useMemo(() => {
        const available: Klavye[] = [];
        const outOfStock: Klavye[] = [];
        filteredKlavyeler.forEach(klavye => {
            if (klavye.stok.durum === 'out_of_stock') {
                outOfStock.push(klavye);
            } else {
                available.push(klavye);
            }
        });
        return { available, outOfStock };
    }, [filteredKlavyeler]);

    return (
        <div className="picker-container">
            <h2>
                Klavye Seçimi
                {filteredKlavyeler && ` (${filteredKlavyeler.length} adet)`}
            </h2>
            {!klavyeler || klavyeler.length === 0 ? (
                <p>Klavye bulunamadı veya klavye verisi yüklenemedi.</p>
            ) : (
                <>
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="Klavye ara... (örn: Razer)"
                    />{/* Stokta Olanlar */}
                    {available.length > 0 && (
                        <ul>
                            {available.map((klavye) => (
                                <RenderListItem
                                    key={klavye.id}
                                    item={klavye}
                                    isSelected={klavye.id === seciliKlavyeId}
                                    isOutOfStock={false}
                                    onSelect={onKlavyeSelect}
                                />
                            ))}
                        </ul>
                    )}

                    {/* Stokta Olmayanlar */}
                    {outOfStock.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Stokta Yok</h3>
                            <ul>
                                {outOfStock.map((klavye) => (
                                    <RenderListItem
                                        key={klavye.id}
                                        item={klavye}
                                        isSelected={false}
                                        isOutOfStock={true}
                                        onSelect={onKlavyeSelect}
                                    />
                                ))}
                            </ul>
                        </>
                    )}
                    {/* Uyumsuz grubu klavye için yok */}
                    {available.length === 0 && outOfStock.length === 0 && (
                        <p>Listelenecek klavye bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default KlavyePicker;