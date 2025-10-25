
import React, { useMemo, useState } from 'react';
import type { IslemciSogutucu, Islemci, Kasa } from '../types/parts';
import FilterSearch, { FilterOptions } from './FilterSearch';
import { filterParts, getUniqueBrands, getMaxPrice, getUniqueFeatures } from '../utils/filterUtils';

interface CpuSogutucuPickerProps {
    cpuSogutuculari: IslemciSogutucu[];
    seciliIslemci: Islemci | null;
    seciliKasa: Kasa | null;
    seciliCpuSogutucuId?: string | null;
    onCpuSogutucuSelect: (sogutucu: IslemciSogutucu) => void;
}

interface ListItemProps {
    item: IslemciSogutucu;
    isSelected: boolean;
    isOutOfStock: boolean;
    isUyumlu: boolean;
    onSelect: (item: IslemciSogutucu) => void;
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
            title={!isUyumlu ? `Uyumsuz: ${uyumsuzlukNedeni.trim()}` : undefined}
        >
            <span>
                {item.ad} ({item.tip}, TDP: {item.max_tdp_w || 'N/A'}W, Yükseklik: {item.yukseklik_mm || 'N/A'}mm) - {item.fiyat_try.toLocaleString('tr-TR')} TRY
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

const CpuSogutucuPicker: React.FC<CpuSogutucuPickerProps> = ({ cpuSogutuculari, seciliIslemci, seciliKasa, seciliCpuSogutucuId, onCpuSogutucuSelect }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        features: []
    });

    const filterData = useMemo(() => {
        if (!cpuSogutuculari || cpuSogutuculari.length === 0) {
            return { availableBrands: [], availableFeatures: [], maxPrice: 0 };
        }
        return {
            availableBrands: getUniqueBrands(cpuSogutuculari),
            availableFeatures: getUniqueFeatures(cpuSogutuculari),
            maxPrice: getMaxPrice(cpuSogutuculari)
        };
    }, [cpuSogutuculari]);

    const filteredSogutuculari = useMemo(() => {
        if (!cpuSogutuculari || cpuSogutuculari.length === 0) return [];
        return filterParts(cpuSogutuculari, { ...filters, maxPrice: filters.maxPrice || filterData.maxPrice });
    }, [cpuSogutuculari, filters, filterData.maxPrice]);

    const { availableCompatible, outOfStockCompatible, incompatibleItems } = useMemo(() => {
        const availableCompatible: {sogutucu: IslemciSogutucu; uyumsuzlukNedeni: string}[] = [];
        const outOfStockCompatible: {sogutucu: IslemciSogutucu; uyumsuzlukNedeni: string}[] = [];
        const incompatibleItems: {sogutucu: IslemciSogutucu; uyumsuzlukNedeni: string}[] = [];

        if (seciliIslemci && seciliKasa && filteredSogutuculari) {
            const kasaDesteklenenRadyatorler = [
                ...(seciliKasa.radyator_destek?.front || []),
                ...(seciliKasa.radyator_destek?.top || []),
                ...(seciliKasa.radyator_destek?.rear || [])
            ];

            filteredSogutuculari.forEach(sogutucu => {
                const isOutOfStock = sogutucu.stok.durum === 'out_of_stock';

                if (!sogutucu.desteklenen_soketler.includes(seciliIslemci.soket)) {
                    incompatibleItems.push({ sogutucu, uyumsuzlukNedeni: `Socket uyumsuzluğu: ${seciliIslemci.soket} desteklenmiyor` });
                    return;
                }

                if (sogutucu.max_tdp_w < seciliIslemci.tdp_w) {
                    incompatibleItems.push({ sogutucu, uyumsuzlukNedeni: `TDP yetersiz: ${sogutucu.max_tdp_w}W < ${seciliIslemci.tdp_w}W` });
                    return;
                }

                if (sogutucu.tip === 'Air' && sogutucu.yukseklik_mm > (seciliKasa.cpu_sogutucu_yukseklik_max_mm || 0)) {
                    incompatibleItems.push({ sogutucu, uyumsuzlukNedeni: `Kasa yüksekliği yetersiz: ${sogutucu.yukseklik_mm}mm > ${seciliKasa.cpu_sogutucu_yukseklik_max_mm}mm` });
                    return;
                }

                if (sogutucu.tip === 'Liquid' && sogutucu.radyator_mm && !kasaDesteklenenRadyatorler.includes(sogutucu.radyator_mm)) {
                    incompatibleItems.push({ sogutucu, uyumsuzlukNedeni: `Kasa ${sogutucu.radyator_mm}mm radyatörü desteklemiyor` });
                    return;
                }

                if (isOutOfStock) {
                    outOfStockCompatible.push({ sogutucu, uyumsuzlukNedeni: '' });
                } else {
                    availableCompatible.push({ sogutucu, uyumsuzlukNedeni: '' });
                }
            });
        }

        return { availableCompatible, outOfStockCompatible, incompatibleItems };
    }, [filteredSogutuculari, seciliIslemci, seciliKasa]);

    if (!seciliIslemci || !seciliKasa) {
        return (
            <div className="picker-container">
                <h2>CPU Soğutucu Seçimi</h2>
                <p>Lütfen önce uyumlu bir İşlemci ve Kasa seçin.</p>
            </div>
        );
    }

    return (
        <div className="picker-container">
            <h2>
                CPU Soğutucu Seçimi
                {filteredSogutuculari && ` (${filteredSogutuculari.length} adet)`}
            </h2>
            {!cpuSogutuculari || cpuSogutuculari.length === 0 ? (
                <p>CPU Soğutucu bulunamadı veya veri yüklenemedi.</p>
            ) : (
                <>
                    <FilterSearch
                        onFilterChange={setFilters}
                        availableBrands={filterData.availableBrands}
                        availableFeatures={filterData.availableFeatures}
                        maxPrice={filterData.maxPrice}
                        placeholder="CPU Soğutucu ara... (örn: Cooler Master)"
                    />
                    
                    {/* Uyumlu ve Stokta */}
                    {availableCompatible.length > 0 && (
                        <ul>
                            {availableCompatible.map(({sogutucu}) => (
                                <RenderListItem
                                    key={sogutucu.id}
                                    item={sogutucu}
                                    isSelected={sogutucu.id === seciliCpuSogutucuId}
                                    isOutOfStock={false}
                                    isUyumlu={true}
                                    onSelect={onCpuSogutucuSelect}
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
                                {outOfStockCompatible.map(({sogutucu}) => (
                                    <RenderListItem
                                        key={sogutucu.id}
                                        item={sogutucu}
                                        isSelected={false}
                                        isOutOfStock={true}
                                        isUyumlu={true}
                                        onSelect={onCpuSogutucuSelect}
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
                                {incompatibleItems.map(({sogutucu, uyumsuzlukNedeni}) => (
                                    <RenderListItem
                                        key={sogutucu.id}
                                        item={sogutucu}
                                        isSelected={false}
                                        isOutOfStock={sogutucu.stok.durum === 'out_of_stock'}
                                        isUyumlu={false}
                                        onSelect={onCpuSogutucuSelect}
                                        uyumsuzlukNedeni={uyumsuzlukNedeni}
                                    />
                                ))}
                            </ul>
                        </>
                    )}

                    {availableCompatible.length === 0 && outOfStockCompatible.length === 0 && incompatibleItems.length === 0 && (
                        <p>Listelenecek CPU soğutucu bulunamadı.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default CpuSogutucuPicker;