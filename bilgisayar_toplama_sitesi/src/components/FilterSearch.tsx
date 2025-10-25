import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterOptions {
    searchTerm: string;
    brand: string;
    minPrice: number;
    maxPrice: number;
    features: string[];
}

interface FilterSearchProps {
    onFilterChange: (filters: FilterOptions) => void;
    availableBrands: string[];
    availableFeatures: string[];
    maxPrice: number;
    placeholder?: string;
}


const cleanFeatureLabel = (feature: string): string => {
    return feature
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};


const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const FilterSearch: React.FC<FilterSearchProps> = ({
                                                       onFilterChange,
                                                       availableBrands,
                                                       availableFeatures,
                                                       maxPrice,
                                                       placeholder = "Arama yapın..."
                                                   }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        searchTerm: '',
        brand: '',
        minPrice: 0,
        maxPrice: maxPrice,
        features: []
    });


    const [isOpen, setIsOpen] = useState(false);

    const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };


    const uniqueCleanFeatures = useMemo(() => {
        const cleaned = availableFeatures.map(cleanFeatureLabel);



        const unique = Array.from(new Set(cleaned));

        return unique.sort();
    }, [availableFeatures]);

    const handleFeatureToggle = (feature: string) => {

        const newFeatures = filters.features.includes(feature)
            ? filters.features.filter(f => f !== feature)
            : [...filters.features, feature];


        handleFilterChange({ features: newFeatures });
    };

    const clearFilters = () => {
        const clearedFilters: FilterOptions = {
            searchTerm: '',
            brand: '',
            minPrice: 0,
            maxPrice: maxPrice,
            features: []
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    return (
        <div className="filter-search-container">

            {/* YENİ: Açılır/Kapanır menü başlığı ve butonu */}
            <div className="filter-header">
                <h4>Filtreler ve Arama</h4>
                {/* DÜZELTME: Buton metni ok ile değiştirildi ve 'open' class'ı eklendi */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`toggle-filter-btn ${isOpen ? 'open' : ''}`}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Filtreleri gizle" : "Filtreleri göster"}
                >
                    ▼
                </button>
            </div>

            {/* YENİ: 'framer-motion' ile animasyonlu açılır/kapanır içerik alanı */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="filter-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="filter-row">
                            {/* Arama Kutusu */}
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    value={filters.searchTerm}
                                    onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                                    className="search-input"
                                />
                            </div>

                            {/* Marka Filtresi */}
                            <div className="filter-group">
                                <label>Marka:</label>
                                <select
                                    value={filters.brand}
                                    onChange={(e) => handleFilterChange({ brand: e.target.value })}
                                    className="filter-select"
                                >
                                    <option value="">Tüm Markalar</option>
                                    {availableBrands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fiyat Filtresi */}
                            <div className="filter-group">
                                <label>Fiyat Aralığı:</label>
                                <div className="price-range">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => handleFilterChange({ minPrice: parseInt(e.target.value) || 0 })}
                                        className="price-input"
                                    />
                                    <span>-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice === maxPrice ? '' : filters.maxPrice}
                                        onChange={(e) => handleFilterChange({ maxPrice: parseInt(e.target.value) || maxPrice })}
                                        className="price-input"
                                    />
                                </div>
                            </div>

                            {/* Temizle Butonu */}
                            <button onClick={clearFilters} className="clear-filters-btn">
                                Filtreleri Temizle
                            </button>
                        </div>

                        {/* DÜZELTME (Problem 1): 'uniqueCleanFeatures' listesini kullan */}
                        {uniqueCleanFeatures.length > 0 && (
                            <div className="features-filter">
                                <label>Özellikler:</label>
                                <div className="features-grid">
                                    {uniqueCleanFeatures.map(feature => (
                                        <label key={feature} className="feature-checkbox">
                                            {/* DÜZELTME (Problem 2): Gizli checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={filters.features.includes(feature)}
                                                onChange={() => handleFeatureToggle(feature)}
                                            />
                                            {/* DÜZELTME (Problem 2): Tıklanabilir modern "pill" stili */}
                                            <span>{capitalizeFirstLetter(feature)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilterSearch;