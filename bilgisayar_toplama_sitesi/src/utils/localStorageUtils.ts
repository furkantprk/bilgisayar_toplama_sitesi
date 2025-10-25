import { 
    Anakart, Islemci, Ram, EkranKarti, PSU, Kasa, Depolama, Monitor, 
    Klavye, Fare, IslemciSogutucu 
} from '../types/parts';

export interface SavedSelections {
    seciliAnakart: Anakart | null;
    seciliIslemci: Islemci | null;
    seciliRam: Ram | null;
    seciliEkranKarti: EkranKarti | null;
    seciliPsu: PSU | null;
    seciliKasa: Kasa | null;
    seciliDepolama: Depolama | null;
    seciliMonitor: Monitor | null;
    seciliKlavye: Klavye | null;
    seciliFare: Fare | null;
    seciliCpuSogutucu: IslemciSogutucu | null;
}

const STORAGE_KEY = 'bilgisayar_toplama_selections';

export function saveSelections(selections: SavedSelections): void {
    try {
        const serialized = JSON.stringify(selections);
        localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
        console.error('Seçimler kaydedilemedi:', error);
    }
}

export function loadSelections(): SavedSelections | null {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (serialized) {
            return JSON.parse(serialized) as SavedSelections;
        }
    } catch (error) {
        console.error('Seçimler yüklenemedi:', error);
    }
    return null;
}

export function clearSelections(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Seçimler temizlenemedi:', error);
    }
}

export function saveSingleSelection<T>(key: keyof SavedSelections, selection: T | null): void {
    try {
        const currentSelections = loadSelections() || getEmptySelections();
        currentSelections[key] = selection as any;
        saveSelections(currentSelections);
    } catch (error) {
        console.error(`${key} seçimi kaydedilemedi:`, error);
    }
}

export function getEmptySelections(): SavedSelections {
    return {
        seciliAnakart: null,
        seciliIslemci: null,
        seciliRam: null,
        seciliEkranKarti: null,
        seciliPsu: null,
        seciliKasa: null,
        seciliDepolama: null,
        seciliMonitor: null,
        seciliKlavye: null,
        seciliFare: null,
        seciliCpuSogutucu: null
    };
}

export function validateSelections(selections: SavedSelections): boolean {
    return true;
}

