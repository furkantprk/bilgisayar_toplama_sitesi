
import React, { useMemo, useState } from 'react';
import type { Monitor } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface MonitorPickerProps {
    monitorler: Monitor[];
    seciliMonitorId?: string | null;
    onMonitorSelect: (monitor: Monitor) => void;
}


interface ListItemProps {
    item: Monitor;
    isSelected: boolean;
    isOutOfStock: boolean;
    onSelect: (item: Monitor) => void;
}

const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, onSelect }) => {
    return (
        <li
            key={item.id}
            className={`
              ${isSelected ? 'selected' : ''}
              ${isOutOfStock ? 'out-of-stock' : ''}
            `}
        >
            <span>
                {item.ad} ({item.boyut_inch}" {item.cozunurluk.ad} {item.yenileme_hizi_hz}Hz {item.panel}) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
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
};

const MonitorPicker: React.FC<MonitorPickerProps> = ({ monitorler, seciliMonitorId, onMonitorSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!monitorler || monitorler.length === 0) {
            return { availableBrands: [], availableFeatures: [], maxPrice: 0 };
        }
        return {
            availableBrands: getUniqueBrands(monitorler),
            availableFeatures: getUniqueFeatures(monitorler),
            maxPrice: getMaxPrice(monitorler)
        };
    }, [monitorler]);


    const filteredMonitorler = useMemo(() => {
        if (!monitorler || monitorler.length === 0) return [];
        return filterParts(monitorler, { ...filters, maxPrice: filters.maxPrice || filterData.maxPrice });
    }, [monitorler, filters, filterData.maxPrice]);


    const { available, outOfStock } = useMemo(() => {
        const available: Monitor[] = [];
        const outOfStock: Monitor[] = [];
        filteredMonitorler.forEach(monitor => {
            if (monitor.stok.durum === 'out_of_stock') {
                outOfStock.push(monitor);
            } else {
                available.push(monitor);
            }
        });
        return { available, outOfStock };
    }, [filteredMonitorler]);

    return (
        <div className="picker-container">
            <h2>
                Monitör Seçimi
                {filteredMonitorler && ` (${filteredMonitorler.length} adet)`}
            </h2>
            {!monitorler || monitorler.length === 0 ? (
                <p>Monitör bulunamadı veya veri yüklenemedi.</p>
            ) : (
                <>
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="Monitör ara... (örn: 144Hz, 4K)"
                    />
                    
                    {/* Stokta Olanlar */}
                    {available.length > 0 && (
                        <ul>
                            {available.map((monitor) => (
                                <RenderListItem
                                    key={monitor.id}
                                    item={monitor}
                                    isSelected={monitor.id === seciliMonitorId}
                                    isOutOfStock={false}
                                    onSelect={onMonitorSelect}
                                />
                            ))}
                        </ul>
                    )}

                    {/* Stokta Olmayanlar */}
                    {outOfStock.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Stokta Yok</h3>
                            <ul>
                                {outOfStock.map((monitor) => (
                                    <RenderListItem
                                        key={monitor.id}
                                        item={monitor}
                                        isSelected={false}
                                        isOutOfStock={true}
                                        onSelect={onMonitorSelect}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {available.length === 0 && outOfStock.length === 0 && (
                        <p>Listelenecek monitör bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default MonitorPicker;