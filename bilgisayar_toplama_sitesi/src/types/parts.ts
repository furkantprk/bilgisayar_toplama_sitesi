interface StokDurumu {
    durum: "in_stock" | "out_of_stock" | string;
    adet: number;
}


interface BoyutlarMM {
    yukseklik?: number;
    genislik?: number;
    derinlik?: number;
    uzunluk_mm?: number;
    kalinlik_slot?: number;
}


interface UyumlulukNotu {
    anakart_kontrol?: string;
    tdp_kontrol?: string;
    oneri?: string;
    onerilen_gpu_tgp_max_w?: number;
    pcie_gereksinimi?: string;
    slot_ihtiyaci?: string;
    m2_not?: string;
    pcie_not?: string;
    psu_kontrol?: string;
}


interface PilDetaylari {
    kapasite_birim: string;
    deger: number;



    saris?: string;
    sarj?: string;
}




interface TemelUrun {
    id: string;
    marka: string;
    model: string;
    ad: string;
}




interface AnakartCPUUyumluluk {
    vendor: "AMD" | "Intel";
    socket: string;
    nesiller: string[];
}
interface AnakartBellek {
    tip: "DDR4" | "DDR5";
    yuva_sayisi: number;
    max_kapasite_gb: number;
    hiz_mhz: number[];
}
interface AnakartDepolama {
    sata: number;
    m2: number;
    m2_pci_gen: string;
}
interface AnakartGenisleme {
    pcie_x16: number;
    pcie_x1: number;
    pcie_gen: string;
}
interface AnakartAg {
    ethernet: string;
    wifi_bluetooth: string | null;
}
interface AnakartArkaPanel {
    usb: number;
    video: string[];
    audio: string;
}


interface IslemciBellekDestek {
    tip: "DDR4" | "DDR5";
    max_mhz: number;
}


interface RamDestekPlatform {
    intel: boolean;
    amd: boolean;
}
interface RamUyumluluk {
    bellek_tip: "DDR4" | "DDR5";
    uyumlu_soketler: string[];
    oneri: string;
}


interface EkranKartiVRAM {
    boyut_gb: number;
    tip: string;
}
interface EkranKartiPCIe {
    surum: string;
    hat_sayisi: string;
    fiziksel: "x16";
}
interface EkranKartiGuc {
    tgp_w: number;
    ek_guc_konnektoru: string[];
    onerilen_psu_w: number;
}
interface EkranKartiCikislar {
    hdmi: number;
    dp: number;
    dvi: number;
}



interface PSU_Baglantilar {
    pcie_8pin_adet: number;
    pcie_12vhpwr_adet: number;
    eps_8pin_adet: number;
    sata_adet: number;
}


interface KasaPSUDahili extends PSU_Baglantilar {
    guc_w: number;
    efficiency: string;
    form_factor: string;
    moduler: string;

}
interface KasaFanlarDahil {
    on: number;
    arka: number;

}
interface KasaRadyatorDestek {
    front: (number | string)[];
    top: (number | string)[];
    rear: (number | string)[];
}
interface KasaOnPanel {
    usb_a: number;
    usb_c: number;
    audio: number;
}
interface KasaHavaAkisi {
    on: number;
    ust: number;
    arka: number;
}



interface MonitorCozunurluk {
    ad: string;
    gen: number;
    yuk: number;
    oran: string;
}
interface MonitorOzellikler {
    hdr: string | null;
    fre_sync: boolean;
    g_sync_compatible: boolean;
    curved: boolean;
    ultrawide: boolean;
}
interface MonitorBaglantilar {
    hdmi: number;
    dp: number;
    usb_c_dp: number;
    usbhub: number;
}
interface MonitorErgonomi {
    tilt: boolean;
    height: boolean;
    swivel: boolean;
    pivot: boolean;
}


interface DepolamaArayuz {
    tip: "SATA" | "M.2 SATA" | "M.2 NVMe";
    protokol: string;
    port: string;
    pcie_gen?: number | string | null;
    lanes?: number | null;
}
interface DepolamaPerformans {
    okuma_mb_s: number;
    yazma_mb_s: number;
    iops_rand_okuma: number;
    iops_rand_yazma: number;
}



interface KlavyeSwitch {
    tip: string;
    hot_swap: boolean;
}
interface KlavyeBaglanti {
    tip: string;
    kablo?: string;
    dongle?: string;
    bluetooth?: boolean;
}
interface KlavyeKeycap {
    malzeme: string;
    profil: string;
}
interface KlavyeOzellikler {
    nkey_rollover: boolean;
    macro: boolean;
    multidevice: boolean;
    ses_tuslari: boolean;
}
interface KlavyeUyumluluk {
    isletim_sistemi: string[];
    portlar: string[];
    notlar: string;
}



interface FareDPI {
    min: number;
    max: number;
}
interface FareBaglanti {
    tip: string;
    dongle?: string;
    bluetooth?: boolean;
    kablo: string;
}
interface FareSekil {
    tarz: string;
    tutuc: string;
}
interface FareKaydirma {
    tilt: boolean;
    hizli_scroll: boolean;
}
interface FareYuzey {
    kaplama: string;
    feet: string;
}
interface FareUyumluluk {
    isletim_sistemi: string[];
    portlar: string[];
    notlar: string;
}



interface SogutucuMalzeme {
    soğutucu: string;
    ısı_boru: string;
}





export interface Anakart extends TemelUrun {
    form_factor: "ATX" | "Micro-ATX" | "Mini-ITX";
    yonga_seti: string;
    soket: string;
    cpu_uyumluluk: AnakartCPUUyumluluk;
    bellek: AnakartBellek;
    depolama: AnakartDepolama;
    genisleme: AnakartGenisleme;
    ag: AnakartAg;
    arka_panel: AnakartArkaPanel;
    fiyat_try: number;
    stok: StokDurumu;
    etiketler: string[];
}

export interface Islemci extends TemelUrun {
    vendor: "AMD" | "Intel";
    soket: string;
    nesil: string;
    cekirdek_sayi: number;
    izlek_sayi: number;
    temel_hiz_ghz: number;
    turbo_hiz_ghz: number;
    tdp_w: number;
    bellek_destek: IslemciBellekDestek;
    igpu: boolean | null;
    fiyat_try: number;
    stok: StokDurumu;
    etiketler: string[];
}

export interface Ram extends TemelUrun {
    seri: string;
    tip: "DDR4" | "DDR5";
    kapasite_kit_gb: number;
    modul_sayisi: number;
    kapasite_modul_gb: number;
    hiz_mhz: number;
    hiz_profilleri_mhz: number[];
    cas: number;
    volt: number;
    profil: ("XMP" | "EXPO")[];
    destek_platform: RamDestekPlatform;
    uyumluluk: RamUyumluluk;
    form_factor: "UDIMM";
    ecc: boolean;
    rank: "single" | "dual";
    soğutucu: boolean;
    rgb: boolean;
    fiyat_try: number;
    stok: StokDurumu;
    etiketler: string[];
}

export interface EkranKarti extends TemelUrun {
    seri: string;
    vram: EkranKartiVRAM;
    pcie_arayuz: EkranKartiPCIe;
    guc: EkranKartiGuc;
    boyut: BoyutlarMM;
    ekran_cikislari: EkranKartiCikislar;
    uyumluluk: UyumlulukNotu;
    stok: StokDurumu;
    fiyat_try: number;
    etiketler?: string[];
}

export interface PSU extends TemelUrun {
    seri: string;
    guc_w: number;
    efficiency: string;
    form_factor: "ATX" | "SFX" | "SFX-L";
    moduler: "full" | "semi" | "non";
    boyut: BoyutlarMM;
    baglantilar: PSU_Baglantilar;
    korumalar: string[];
    uyumluluk: UyumlulukNotu;
    fiyat_try: number;
    stok: StokDurumu;
    etiketler: string[];
}

export interface Kasa extends TemelUrun {
    form_factor: string;
    mobo_destek: string[];
    gpu_uzunluk_max_mm: number;
    cpu_sogutucu_yukseklik_max_mm: number;
    psu_destek: string[];
    psu_tumlesik: boolean;
    psu_dahili: KasaPSUDahili | null;
    hava_akisi: KasaHavaAkisi;
    fanlar_dahil: KasaFanlarDahil;
    radyator_destek: KasaRadyatorDestek;
    on_panel: KasaOnPanel;
    boyutlar_mm: BoyutlarMM;
    stok: StokDurumu;
    fiyat_try: number;
    uyumluluk: UyumlulukNotu;
    etiketler: string[];
}

export interface Monitor extends TemelUrun {
    seri: string;
    boyut_inch: number;
    cozunurluk: MonitorCozunurluk;
    panel: string;
    yenileme_hizi_hz: number;
    tepkime_ms_gtg: number;
    ozellikler: MonitorOzellikler;
    baglantilar: MonitorBaglantilar;
    ergonomi: MonitorErgonomi;
    fiyat_try: number;
    stok: StokDurumu;
    etiketler: string[];
}

export interface Depolama extends TemelUrun {
    form_factor: "2.5in" | "3.5in" | "M.2 2280" | "M.2 2230" | "M.2 2242";
    arayuz: DepolamaArayuz;
    kapasite_gb: number;
    performans: DepolamaPerformans;
    dayaniklilik_tbw: number | null;
    rpm: number | null;
    onbellek_mb: number | null;
    m2_boy: "2280" | "2230" | "2242" | null;
    uyumluluk: UyumlulukNotu;
    fiyat_try: number;
    stok: StokDurumu;
    etiketler: (string | null)[];
}

export interface Klavye extends TemelUrun {
    seri: string;
    boyut: string;
    dizilim: string;
    switch: KlavyeSwitch;
    baglanti: KlavyeBaglanti;
    kablosuz: boolean;
    polling_hz: number;
    keycap: KlavyeKeycap;
    arkadan_aydinlatma: string | null;
    ozellikler: KlavyeOzellikler;
    pil: PilDetaylari | null;
    uyumluluk: KlavyeUyumluluk;
    fiyat_try: number;
    stok: StokDurumu;
    etiketler: string[];
}

export interface Fare extends TemelUrun {
    sensor: string;
    dpi: FareDPI;
    agirlik_g: number;
    polling_hz: number;
    baglanti: FareBaglanti;
    kablosuz: boolean;
    pil: PilDetaylari | null;
    sekil: FareSekil;
    tus_sayisi: number;
    kaydirma: FareKaydirma;
    yuzey: FareYuzey;
    uyumluluk: FareUyumluluk;
    fiyat_try: number;
    stok: StokDurumu;
    etiketler: string[];
}

export interface IslemciSogutucu extends TemelUrun {
    tip: "Air" | "Liquid";
    fan_sayisi: number;
    fan_boyutu_mm: number;
    radyator_mm: number | null;
    pompa_rpm?: number | null;
    yukseklik_mm: number;
    desteklenen_soketler: string[];
    max_tdp_w: number;
    gürültü_db: number;
    rgb: boolean;
    malzeme: SogutucuMalzeme;
    uyumluluk: UyumlulukNotu;
    stok: StokDurumu;
    fiyat_try: number;
    etiketler: string[];
}

export {};