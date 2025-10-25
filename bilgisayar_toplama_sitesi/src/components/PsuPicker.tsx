
import React, { useMemo, useState } from 'react';
import type { PSU, Islemci, EkranKarti } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface PsuPickerProps {
    psular: PSU[];
    seciliIslemci: Islemci | null;
    seciliEkranKarti: EkranKarti | null;
    seciliPsuId?: string | null;
    onPsuSelect: (psu: PSU) => void;
}


interface ListItemProps {
    item: PSU; isSelected: boolean; isOutOfStock: boolean; isUyumlu: boolean;
    onSelect: (item: PSU) => void; uyumsuzlukNedeni: string;
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
            title={!isUyumlu ? `Uyumsuz: ${uyumsuzlukNedeni.trim()}` : undefined}
        >
            <span>
                {item.ad} ({item.guc_w}W {item.efficiency}, {item.moduler}) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
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


const PsuPicker: React.FC<PsuPickerProps> = ({ psular, seciliIslemci, seciliEkranKarti, seciliPsuId, onPsuSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });


    const filterData = useMemo(() => {
        if (!psular || psular.length === 0) {
            return {
                availableBrands: [],
                maxPrice: 0,
                availableFeatures: []
            };
        }

        return {
            availableBrands: getUniqueBrands(psular),
            maxPrice: getMaxPrice(psular),
            availableFeatures: getUniqueFeatures(psular)
        };
    }, [psular]);


    const filteredPsular = useMemo(() => {
        if (!psular || psular.length === 0) return [];

        const filtersToApply = {
            ...filters,
            maxPrice: filters.maxPrice || filterData.maxPrice
        };

        return filterParts(psular, filtersToApply);
    }, [psular, filters, filterData.maxPrice]);


    const { availableCompatible, outOfStockCompatible, incompatibleItems } = useMemo(() => {
        const availableCompatible: {psu: PSU; uyumsuzlukNedeni: string}[] = [];
        const outOfStockCompatible: {psu: PSU; uyumsuzlukNedeni: string}[] = [];
        const incompatibleItems: {psu: PSU; uyumsuzlukNedeni: string}[] = [];

        if (seciliIslemci && seciliEkranKarti && filteredPsular) {
            const gerekliMinWatt = seciliIslemci.tdp_w + seciliEkranKarti.guc.tgp_w + 150;
            const gpuGerekliKonnektorler = seciliEkranKarti.guc.ek_guc_konnektoru || [];
            let pcie8PinIhtiyac = 0;
            let pcie12vhpwrIhtiyac = 0;
            gpuGerekliKonnektorler.forEach(kon => {
                const match8pin = kon.match(/(\d+)\s*x\s*8-pin/i);
                if (match8pin) pcie8PinIhtiyac += parseInt(match8pin[1], 10);
                else if (kon.toLowerCase().includes('8-pin')) pcie8PinIhtiyac += 1;
                else if (kon.toUpperCase().includes('12VHPWR')) pcie12vhpwrIhtiyac += 1;
            });

            filteredPsular.forEach(psu => {
                const isOutOfStock = psu.stok.durum === 'out_of_stock';
                let uyumsuzlukNedeni = '';
                const wattYeterli = psu.guc_w >= gerekliMinWatt;
                const konnektor8PinYeterli = psu.baglantilar.pcie_8pin_adet >= pcie8PinIhtiyac;
                const konnektor12vhpwrYeterli = psu.baglantilar.pcie_12vhpwr_adet >= pcie12vhpwrIhtiyac;
                const isUyumlu = wattYeterli && konnektor8PinYeterli && konnektor12vhpwrYeterli;

                if (!isUyumlu) {
                    if (!wattYeterli) uyumsuzlukNedeni = `Yetersiz Watt (En az ${gerekliMinWatt}W gerekli). `;
                    if (!konnektor8PinYeterli || !konnektor12vhpwrYeterli) uyumsuzlukNedeni += `Yetersiz Güç Konnektörü (İhtiyaç: ${pcie8PinIhtiyac}x8pin, ${pcie12vhpwrIhtiyac}x12VHPWR).`;
                }

                const item = { psu, uyumsuzlukNedeni: uyumsuzlukNedeni.trim() };
                if (isUyumlu) {
                    if (isOutOfStock) outOfStockCompatible.push(item);
                    else availableCompatible.push(item);
                } else {
                    incompatibleItems.push(item);
                }
            });
        }
        return { availableCompatible, outOfStockCompatible, incompatibleItems };
    }, [filteredPsular, seciliIslemci, seciliEkranKarti]);


    if (!seciliIslemci || !seciliEkranKarti) {
        return (
            <div className="picker-container">
                <h2>Güç Kaynağı Seçimi</h2>
                <p>Lütfen önce uyumlu bir İşlemci ve Ekran Kartı seçin.</p>
            </div>
        );
    }

    return (
        <div className="picker-container">
            <h2>
                Güç Kaynağı Seçimi
                {filteredPsular && ` (${filteredPsular.length} adet)`}
            </h2>
            {!psular || psular.length === 0 ? (
                <p>Güç kaynağı bulunamadı veya veri yüklenemedi.</p>
            ) : (
                <>
                    {/* Filtreleme ve Arama */}
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="PSU ara... (örn: 80+ Gold)"
                    />
                    {/* Uyumlu ve Stokta */}
                    {availableCompatible.length > 0 && (
                        <ul>
                            {availableCompatible.map(({psu}) => (
                                <RenderListItem
                                    key={psu.id} item={psu}
                                    isSelected={psu.id === seciliPsuId}
                                    isOutOfStock={false} isUyumlu={true}
                                    onSelect={onPsuSelect} uyumsuzlukNedeni=""
                                />
                            ))}
                        </ul>
                    )}

                    {/* Uyumlu - Stokta Yok */}
                    {outOfStockCompatible.length > 0 && (
                        <>
                            <h3 className="section-header out-of-stock-header">Uyumlu - Stokta Yok</h3>
                            <ul>
                                {outOfStockCompatible.map(({psu}) => (
                                    <RenderListItem
                                        key={psu.id} item={psu}
                                        isSelected={false} isOutOfStock={true} isUyumlu={true}
                                        onSelect={onPsuSelect} uyumsuzlukNedeni=""
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
                                {incompatibleItems.map(({psu, uyumsuzlukNedeni}) => (
                                    <RenderListItem
                                        key={psu.id} item={psu}
                                        isSelected={false} isOutOfStock={psu.stok.durum === 'out_of_stock'} isUyumlu={false}
                                        onSelect={onPsuSelect} uyumsuzlukNedeni={uyumsuzlukNedeni}
                                    />
                                ))}
                            </ul>
                        </>
                    )}
                    {availableCompatible.length === 0 && outOfStockCompatible.length === 0 && incompatibleItems.length === 0 && (
                        <p>Listelenecek güç kaynağı bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default PsuPicker;