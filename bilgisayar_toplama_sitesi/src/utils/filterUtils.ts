import { FilterOptions } from '../components/FilterSearch';
import { 
    Anakart, Islemci, Ram, EkranKarti, PSU, Kasa, Depolama, Monitor, 
    Klavye, Fare, IslemciSogutucu 
} from '../types/parts';

export type PartType = Anakart | Islemci | Ram | EkranKarti | PSU | Kasa | Depolama | Monitor | Klavye | Fare | IslemciSogutucu;

export function filterParts<T extends PartType>(
    parts: T[],
    filters: FilterOptions
): T[] {
    if (!parts || parts.length === 0) return [];

    return parts.filter(part => {
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            const searchableText = `${part.ad} ${part.marka} ${part.model}`.toLowerCase();
            if (!searchableText.includes(searchLower)) {
                return false;
            }
        }

        if (filters.brand && part.marka !== filters.brand) {
            return false;
        }

        if (part.fiyat_try < filters.minPrice || part.fiyat_try > filters.maxPrice) {
            return false;
        }

        if (filters.features.length > 0) {
            const partFeatures = getPartFeatures(part);
            const hasMatchingFeature = filters.features.some(feature =>
                partFeatures.some(partFeature => 
                    partFeature.toLowerCase().includes(feature.toLowerCase()) ||
                    feature.toLowerCase().includes(partFeature.toLowerCase())
                )
            );
            if (!hasMatchingFeature) {
                return false;
            }
        }

        return true;
    });
}

function getPartFeatures(part: PartType): string[] {
    const features: string[] = [];

    if (part.etiketler) {
        const validEtiketler = part.etiketler.filter((etiket): etiket is string => 
            etiket !== null && etiket !== undefined
        ) as string[];
        features.push(...validEtiketler);
    }

    switch (part.id.split('-')[0]) {
        case 'anakart':
            const anakart = part as Anakart;
            features.push(
                anakart.form_factor,
                anakart.bellek.tip,
                `DDR${anakart.bellek.tip === 'DDR4' ? '4' : '5'}`,
                ...anakart.cpu_uyumluluk.nesiller
            );
            break;

        case 'cpu':
            const cpu = part as Islemci;
            features.push(
                cpu.vendor,
                cpu.soket,
                cpu.nesil,
                `${cpu.cekirdek_sayi} cekirdek`,
                `${cpu.izlek_sayi} izlek`,
                `${cpu.tdp_w}W TDP`
            );
            if (cpu.igpu) features.push('Entegre GPU');
            break;

        case 'ram':
            const ram = part as Ram;
            features.push(
                ram.tip,
                `DDR${ram.tip === 'DDR4' ? '4' : '5'}`,
                `${ram.kapasite_kit_gb}GB`,
                `${ram.hiz_mhz}MHz`,
                ...ram.profil
            );
            if (ram.rgb) features.push('RGB');
            if (ram.soğutucu) features.push('Sogutucu');
            break;

        case 'gpu':
            const gpu = part as EkranKarti;
            features.push(
                gpu.seri,
                `${gpu.vram.boyut_gb}GB VRAM`,
                `${gpu.vram.tip}`,
                `${gpu.guc.tgp_w}W TGP`
            );
            break;

        case 'psu':
            const psu = part as PSU;
            features.push(
                `${psu.guc_w}W`,
                psu.efficiency,
                psu.moduler,
                psu.form_factor
            );
            break;

        case 'kasa':
            const kasa = part as Kasa;
            features.push(
                kasa.form_factor,
                ...kasa.mobo_destek,
                ...kasa.psu_destek
            );
            if (kasa.psu_tumlesik) features.push('PSU Tumlesik');
            break;

        case 'depolama':
            const depolama = part as Depolama;
            features.push(
                depolama.form_factor,
                depolama.arayuz.tip,
                `${depolama.kapasite_gb}GB`,
                depolama.arayuz.protokol
            );
            break;

        case 'monitor':
            const monitor = part as Monitor;
            features.push(
                `${monitor.boyut_inch}"`,
                monitor.panel,
                `${monitor.yenileme_hizi_hz}Hz`,
                `${monitor.cozunurluk.gen}x${monitor.cozunurluk.yuk}`,
                `${monitor.tepkime_ms_gtg}ms`
            );
            if (monitor.ozellikler.hdr) features.push('HDR');
            if (monitor.ozellikler.curved) features.push('Curved');
            if (monitor.ozellikler.ultrawide) features.push('Ultrawide');
            break;

        case 'klavye':
            const klavye = part as Klavye;
            features.push(
                klavye.boyut,
                klavye.dizilim,
                klavye.switch.tip,
                klavye.baglanti.tip
            );
            if (klavye.kablosuz) features.push('Kablosuz');
            if (klavye.arkadan_aydinlatma) features.push('Aydinlatma');
            break;

        case 'fare':
            const fare = part as Fare;
            features.push(
                fare.sensor,
                `${fare.dpi.max} DPI`,
                fare.baglanti.tip,
                fare.sekil.tarz
            );
            if (fare.kablosuz) features.push('Kablosuz');
            break;

        case 'sogutucu':
            const sogutucu = part as IslemciSogutucu;
            features.push(
                sogutucu.tip,
                `${sogutucu.max_tdp_w}W TDP`,
                `${sogutucu.gürültü_db}dB`,
                ...sogutucu.desteklenen_soketler
            );
            if (sogutucu.rgb) features.push('RGB');
            break;
    }

    return features;
}

export function getUniqueBrands<T extends PartType>(parts: T[]): string[] {
    const brands = new Set<string>();
    parts.forEach(part => brands.add(part.marka));
    return Array.from(brands).sort();
}

export function getMaxPrice<T extends PartType>(parts: T[]): number {
    if (!parts || parts.length === 0) return 0;
    return Math.max(...parts.map(part => part.fiyat_try));
}

export function getUniqueFeatures<T extends PartType>(parts: T[]): string[] {
    const features = new Set<string>();
    
    parts.forEach(part => {
        const partFeatures = getPartFeatures(part);
        partFeatures.forEach(feature => features.add(feature));
    });
    
    return Array.from(features).sort();
}
