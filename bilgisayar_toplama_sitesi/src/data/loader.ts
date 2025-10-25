

import type {
    Anakart, Islemci, Ram, EkranKarti, PSU, Kasa, Monitor,
    Depolama, Klavye, Fare, IslemciSogutucu
} from '../types/parts';

export interface TumParcalar {
    anakartlar: Anakart[];
    islemciler: Islemci[];
    ramlar: Ram[];
    ekranKartlari: EkranKarti[];
    psular: PSU[];
    kasalar: Kasa[];
    monitorler: Monitor[];
    depolamalar: Depolama[];
    klavyeler: Klavye[];
    fareler: Fare[];
    islemciSogutuculari: IslemciSogutucu[];
}

const dosyaAdlari: (keyof TumParcalar)[] = [
    'anakartlar', 'islemciler', 'ramlar', 'ekranKartlari',
    'psular', 'kasalar', 'monitorler', 'depolamalar',
    'klavyeler', 'fareler', 'islemciSogutuculari'
];

const anahtarToJsonAdi = (anahtar: keyof TumParcalar): string => {
    if (anahtar === 'ekranKartlari') return 'ekran_karti.json';
    if (anahtar === 'islemciSogutuculari') return 'islemci_sogutucu.json';
    const dosyaKoku = anahtar.replace(/lar$|ler$/, '');
    return `${dosyaKoku}.json`;
}

export const verileriYukle = async (): Promise<TumParcalar | null> => {
    try {
        const yuklenenVeriler = {} as Partial<TumParcalar>;

        const istekler = dosyaAdlari.map(async (anahtar) => {
            const dosyaAdi = anahtarToJsonAdi(anahtar);
            try {
                const response = await fetch(`/data/${dosyaAdi}`);
                if (!response.ok) {
                    console.error(`${dosyaAdi} yüklenemedi: ${response.status} ${response.statusText}`);
                    yuklenenVeriler[anahtar] = [] as any;
                    return;
                }
                const data = await response.json();
                yuklenenVeriler[anahtar] = data as any;
            } catch (fetchError) {
                console.error(`${dosyaAdi} yüklenirken ağ hatası:`, fetchError);
                yuklenenVeriler[anahtar] = [] as any;
            }
        });

        await Promise.all(istekler);

        const eksikAnahtarlar = dosyaAdlari.filter(anahtar => !(anahtar in yuklenenVeriler) || yuklenenVeriler[anahtar]?.length === 0 );
        if (eksikAnahtarlar.length > 0) {
            console.warn(`Bazı veriler yüklenemedi veya boş: ${eksikAnahtarlar.join(', ')}`);
        }


        return yuklenenVeriler as TumParcalar;

    } catch (error) {
        console.error("Genel veri yükleme hatası:", error);
        return null;
    }
};