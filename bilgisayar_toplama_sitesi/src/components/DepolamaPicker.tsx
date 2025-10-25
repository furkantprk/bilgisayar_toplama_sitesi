
import React, { useMemo, useState } from 'react';
import type { Depolama, Anakart } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';

import { filterParts, getUniqueBrands, getMaxPrice } from '../utils/filterUtils';

interface DepolamaPickerProps {
    depolamalar: Depolama[];
    seciliAnakart: Anakart | null;
    seciliDepolamaId?: string | null;
    onDepolamaSelect: (depolama: Depolama) => void;

}


interface ListItemProps {
    item: Depolama;
    isSelected: boolean;
    isOutOfStock: boolean;
    isUyumlu: boolean;
    onSelect: (item: Depolama) => void;
    uyumsuzlukNedeni: string;
}

const RenderListItem: React.FC<ListItemProps> = ({ item, isSelected, isOutOfStock, isUyumlu, onSelect, uyumsuzlukNedeni }) => {
    return (
        <li
            key={item.id}
            className={`
              ${isSelected ? 'selected' : ''}
              ${isOutOfStock ? 'out-of-stock' : ''}
              ${!isUyumlu ? 'incompatible' : ''}
            `}
            title={!isUyumlu ? `Uyumsuz: ${uyumsuzlukNedeni}` : undefined}
        >
            <span>
                {item.ad} ({item.kapasite_gb}GB {item.arayuz.tip} {item.form_factor}) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
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
};

const DepolamaPicker: React.FC<DepolamaPickerProps> = ({
                                                           depolamalar,
                                                           seciliAnakart,
                                                           seciliDepolamaId,
                                                           onDepolamaSelect

                                                       }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!depolamalar || depolamalar.length === 0) {

            return { availableBrands: [], maxPrice: 0 };
        }
        return {
            availableBrands: getUniqueBrands(depolamalar),

            maxPrice: getMaxPrice(depolamalar)
        };
    }, [depolamalar]);


    const filteredDepolamalar = useMemo(() => {
        if (!depolamalar || depolamalar.length === 0) return [];
        return filterParts(depolamalar, { ...filters, maxPrice: filters.maxPrice || filterData.maxPrice });
    }, [depolamalar, filters, filterData.maxPrice]);


    const { availableCompatible, outOfStockCompatible, incompatibleItems } = useMemo(() => {
        const availableCompatible: {dep: Depolama; uyumsuzlukNedeni: string}[] = [];
        const outOfStockCompatible: {dep: Depolama; uyumsuzlukNedeni: string}[] = [];
        const incompatibleItems: {dep: Depolama; uyumsuzlukNedeni: string}[] = [];

        if (seciliAnakart && filteredDepolamalar) {
            filteredDepolamalar.forEach(depolama => {
                const isOutOfStock = depolama.stok.durum === 'out_of_stock';
                let isUyumlu = false;
                let uyumsuzlukNedeni = '';

                if (depolama.form_factor.startsWith('M.2')) {
                    if (seciliAnakart.depolama.m2 >= 1) isUyumlu = true;
                    else uyumsuzlukNedeni = 'Anakartta M.2 yuvası yok.';
                } else if (depolama.arayuz.tip === 'SATA') {
                    if (seciliAnakart.depolama.sata >= 1) isUyumlu = true;
                    else uyumsuzlukNedeni = 'Anakartta SATA portu yok.';
                } else {
                    uyumsuzlukNedeni = 'Bilinmeyen arayüz tipi.';
                }

                const item = { dep: depolama, uyumsuzlukNedeni };
                if (isUyumlu) {
                    if (isOutOfStock) outOfStockCompatible.push(item);
                    else availableCompatible.push(item);
                } else {
                    incompatibleItems.push(item);
                }
            });
        }
        return { availableCompatible, outOfStockCompatible, incompatibleItems };
    }, [filteredDepolamalar, seciliAnakart]);

    if (!seciliAnakart) {
        return (
            <div className="picker-container">
                <h2>Depolama Birimi Seçimi</h2>
                <p>Lütfen önce uyumlu bir anakart seçin.</p>
            </div>
        );
    }

    return (
        <div className="picker-container">
            <h2>
                Depolama Birimi Seçimi
                {filteredDepolamalar && ` (${filteredDepolamalar.length} adet)`}
            </h2>
            {!depolamalar || depolamalar.length === 0 ? (
                <p>Depolama birimi bulunamadı veya veri yüklenemedi.</p>
            ) : (
                <>
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={[]}
                        maxPrice={filterData.maxPrice}
                        placeholder="Depolama ara... (örn: Samsung SSD)"

                    />

                    {/* Uyumlu ve Stokta */}
                    {availableCompatible.length > 0 && (
                        <ul>
                            {availableCompatible.map(({dep}) => (
                                <RenderListItem
                                    key={dep.id}
                                    item={dep}
                                    isSelected={dep.id === seciliDepolamaId}
                                    isOutOfStock={false}
                                    isUyumlu={true}
                                    onSelect={onDepolamaSelect}
                                    uyumsuzlukNedeni=""
                                />
                            ))}
                        </ul>
                    )}

                    {/* Uyumlu - Stokta Yok */}
                    {outOfStockCompatible.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Uyumlu - Stokta Yok</h3>
                            <ul>
                                {outOfStockCompatible.map(({dep}) => (
                                    <RenderListItem
                                        key={dep.id}
                                        item={dep}
                                        isSelected={false}
                                        isOutOfStock={true}
                                        isUyumlu={true}
                                        onSelect={onDepolamaSelect}
                                        uyumsuzlukNedeni=""
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
                                {incompatibleItems.map(({dep, uyumsuzlukNedeni}) => (
                                    <RenderListItem
                                        key={dep.id}
                                        item={dep}
                                        isSelected={false}
                                        isOutOfStock={dep.stok.durum === 'out_of_stock'}
                                        isUyumlu={false}
                                        onSelect={onDepolamaSelect}
                                        uyumsuzlukNedeni={uyumsuzlukNedeni}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {availableCompatible.length === 0 && outOfStockCompatible.length === 0 && incompatibleItems.length === 0 && (
                        <p>Listelenecek depolama birimi bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default DepolamaPicker;