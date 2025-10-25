

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import { verileriYukle, TumParcalar } from './data/loader';
import {
    loadSelections,
    saveSingleSelection,
    getEmptySelections
} from './utils/localStorageUtils';

import AnakartPicker from './components/AnakartPicker';
import IslemciPicker from './components/IslemciPicker';
import RamPicker from './components/RamPicker';
import EkranKartiPicker from './components/EkranKartiPicker';
import PsuPicker from './components/PsuPicker';
import KasaPicker from './components/KasaPicker';
import DepolamaPicker from './components/DepolamaPicker';
import MonitorPicker from './components/MonitorPicker';
import KlavyePicker from './components/KlavyePicker';
import FarePicker from './components/FarePicker';
import CpuSogutucuPicker from './components/CpuSogutucuPicker';
import SelectionStatusSidebar from './components/SelectionStatusSidebar';

import type { Anakart, Islemci, Ram, EkranKarti, PSU, Kasa, Depolama, Monitor, Klavye, Fare, IslemciSogutucu } from './types/parts';
import './App.css';

function App() {
    const [parcalar, setParcalar] = useState<TumParcalar | null>(null);
    const [yukleniyor, setYukleniyor] = useState<boolean>(true);
    const [hata, setHata] = useState<string | null>(null);
    const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

    const [seciliAnakart, setSeciliAnakart] = useState<Anakart | null>(null);
    const [seciliIslemci, setSeciliIslemci] = useState<Islemci | null>(null);
    const [seciliRam, setSeciliRam] = useState<Ram | null>(null);
    const [seciliEkranKarti, setSeciliEkranKarti] = useState<EkranKarti | null>(null);
    const [seciliPsu, setSeciliPsu] = useState<PSU | null>(null);
    const [seciliKasa, setSeciliKasa] = useState<Kasa | null>(null);
    const [seciliDepolama, setSeciliDepolama] = useState<Depolama | null>(null);
    const [seciliMonitor, setSeciliMonitor] = useState<Monitor | null>(null);
    const [seciliKlavye, setSeciliKlavye] = useState<Klavye | null>(null);
    const [seciliFare, setSeciliFare] = useState<Fare | null>(null);
    const [seciliCpuSogutucu, setSeciliCpuSogutucu] = useState<IslemciSogutucu | null>(null);

    const anakartPickerRef = useRef<HTMLDivElement>(null);
    const islemciPickerRef = useRef<HTMLDivElement>(null);
    const ramPickerRef = useRef<HTMLDivElement>(null);
    const ekranKartiPickerRef = useRef<HTMLDivElement>(null);
    const psuPickerRef = useRef<HTMLDivElement>(null);
    const kasaPickerRef = useRef<HTMLDivElement>(null);
    const cpuSogutucuPickerRef = useRef<HTMLDivElement>(null);
    const depolamaPickerRef = useRef<HTMLDivElement>(null);
    const monitorPickerRef = useRef<HTMLDivElement>(null);
    const klavyePickerRef = useRef<HTMLDivElement>(null);
    const farePickerRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            setYukleniyor(true); setHata(null);

            const savedSelections = loadSelections();
            if (savedSelections) {
                setSeciliAnakart(savedSelections.seciliAnakart);
                setSeciliIslemci(savedSelections.seciliIslemci);
                setSeciliRam(savedSelections.seciliRam);
                setSeciliEkranKarti(savedSelections.seciliEkranKarti);
                setSeciliPsu(savedSelections.seciliPsu);
                setSeciliKasa(savedSelections.seciliKasa);
                setSeciliDepolama(savedSelections.seciliDepolama);
                setSeciliMonitor(savedSelections.seciliMonitor);
                setSeciliKlavye(savedSelections.seciliKlavye);
                setSeciliFare(savedSelections.seciliFare);
                setSeciliCpuSogutucu(savedSelections.seciliCpuSogutucu);
            } else {
                setSeciliAnakart(null); setSeciliIslemci(null); setSeciliRam(null); setSeciliEkranKarti(null); setSeciliPsu(null); setSeciliKasa(null); setSeciliDepolama(null); setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null); setSeciliCpuSogutucu(null);
            }

            try {
                const data = await verileriYukle();
                setParcalar(data);
                if (!data) setHata("Veriler yüklenirken bir sorun oluştu.");
            } catch (error) { console.error("Veri yükleme hatası:", error); setHata("Veriler yüklenirken beklenmedik bir hata oluştu."); }
            finally { setYukleniyor(false); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setShowScrollTop(scrollTop > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleAnakartSelect = (anakart: Anakart) => {
        setSeciliAnakart(anakart);
        setSeciliIslemci(null); setSeciliRam(null); setSeciliEkranKarti(null); setSeciliPsu(null); setSeciliKasa(null); setSeciliCpuSogutucu(null); setSeciliDepolama(null); setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliAnakart', anakart);
        saveSingleSelection('seciliIslemci', null); saveSingleSelection('seciliRam', null); saveSingleSelection('seciliEkranKarti', null); saveSingleSelection('seciliPsu', null); saveSingleSelection('seciliKasa', null); saveSingleSelection('seciliCpuSogutucu', null); saveSingleSelection('seciliDepolama', null); saveSingleSelection('seciliMonitor', null); saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handleIslemciSelect = (islemci: Islemci) => {
        setSeciliIslemci(islemci);
        setSeciliRam(null); setSeciliEkranKarti(null); setSeciliPsu(null); setSeciliKasa(null); setSeciliCpuSogutucu(null); setSeciliDepolama(null); setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliIslemci', islemci);
        saveSingleSelection('seciliRam', null); saveSingleSelection('seciliEkranKarti', null); saveSingleSelection('seciliPsu', null); saveSingleSelection('seciliKasa', null); saveSingleSelection('seciliCpuSogutucu', null); saveSingleSelection('seciliDepolama', null); saveSingleSelection('seciliMonitor', null); saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handleRamSelect = (ram: Ram) => {
        setSeciliRam(ram);
        setSeciliEkranKarti(null); setSeciliPsu(null); setSeciliKasa(null); setSeciliCpuSogutucu(null); setSeciliDepolama(null); setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliRam', ram);
        saveSingleSelection('seciliEkranKarti', null); saveSingleSelection('seciliPsu', null); saveSingleSelection('seciliKasa', null); saveSingleSelection('seciliCpuSogutucu', null); saveSingleSelection('seciliDepolama', null); saveSingleSelection('seciliMonitor', null); saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handleEkranKartiSelect = (ekranKarti: EkranKarti) => {
        setSeciliEkranKarti(ekranKarti);
        setSeciliPsu(null); setSeciliKasa(null); setSeciliCpuSogutucu(null); setSeciliDepolama(null); setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliEkranKarti', ekranKarti);
        saveSingleSelection('seciliPsu', null); saveSingleSelection('seciliKasa', null); saveSingleSelection('seciliCpuSogutucu', null); saveSingleSelection('seciliDepolama', null); saveSingleSelection('seciliMonitor', null); saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handlePsuSelect = (psu: PSU) => {
        setSeciliPsu(psu);
        setSeciliKasa(null); setSeciliCpuSogutucu(null); setSeciliDepolama(null); setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliPsu', psu);
        saveSingleSelection('seciliKasa', null); saveSingleSelection('seciliCpuSogutucu', null); saveSingleSelection('seciliDepolama', null); saveSingleSelection('seciliMonitor', null); saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handleKasaSelect = (kasa: Kasa) => {
        setSeciliKasa(kasa);
        setSeciliCpuSogutucu(null); setSeciliDepolama(null); setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliKasa', kasa);
        saveSingleSelection('seciliCpuSogutucu', null); saveSingleSelection('seciliDepolama', null); saveSingleSelection('seciliMonitor', null); saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handleCpuSogutucuSelect = (sogutucu: IslemciSogutucu) => {
        setSeciliCpuSogutucu(sogutucu);
        setSeciliDepolama(null); setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliCpuSogutucu', sogutucu);
        saveSingleSelection('seciliDepolama', null); saveSingleSelection('seciliMonitor', null); saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handleDepolamaSelect = (depolama: Depolama) => {
        setSeciliDepolama(depolama);
        setSeciliMonitor(null); setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliDepolama', depolama);
        saveSingleSelection('seciliMonitor', null); saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handleMonitorSelect = (monitor: Monitor) => {
        setSeciliMonitor(monitor);
        setSeciliKlavye(null); setSeciliFare(null);
        saveSingleSelection('seciliMonitor', monitor);
        saveSingleSelection('seciliKlavye', null); saveSingleSelection('seciliFare', null);
    };

    const handleKlavyeSelect = (klavye: Klavye) => {
        setSeciliKlavye(klavye);
        setSeciliFare(null);
        saveSingleSelection('seciliKlavye', klavye);
        saveSingleSelection('seciliFare', null);
    };

    const handleFareSelect = (fare: Fare) => {
        setSeciliFare(fare);
        saveSingleSelection('seciliFare', fare);
    };

    const handleClearAllSelections = () => {
        setSeciliAnakart(null);
        setSeciliIslemci(null);
        setSeciliRam(null);
        setSeciliEkranKarti(null);
        setSeciliPsu(null);
        setSeciliKasa(null);
        setSeciliDepolama(null);
        setSeciliMonitor(null);
        setSeciliKlavye(null);
        setSeciliFare(null);
        setSeciliCpuSogutucu(null);

        const emptySelections = getEmptySelections();
        localStorage.setItem('bilgisayar_toplama_selections', JSON.stringify(emptySelections));
    };

    const toplamFiyat = useMemo(() => {
        let toplam = 0;
        if (seciliAnakart) toplam += seciliAnakart.fiyat_try;
        if (seciliIslemci) toplam += seciliIslemci.fiyat_try;
        if (seciliRam) toplam += seciliRam.fiyat_try;
        if (seciliEkranKarti) toplam += seciliEkranKarti.fiyat_try;
        if (seciliKasa) {
            toplam += seciliKasa.fiyat_try;
            if (!seciliKasa.psu_tumlesik && seciliPsu) {
                toplam += seciliPsu.fiyat_try;
            }
        } else if (seciliPsu) {
            toplam += seciliPsu.fiyat_try;
        }
        if (seciliDepolama) toplam += seciliDepolama.fiyat_try;
        if (seciliMonitor) toplam += seciliMonitor.fiyat_try;
        if (seciliKlavye) toplam += seciliKlavye.fiyat_try;
        if (seciliFare) toplam += seciliFare.fiyat_try;
        if (seciliCpuSogutucu) toplam += seciliCpuSogutucu.fiyat_try;

        return toplam;
    }, [seciliAnakart, seciliIslemci, seciliRam, seciliEkranKarti, seciliPsu, seciliKasa, seciliDepolama, seciliMonitor, seciliKlavye, seciliFare, seciliCpuSogutucu]);

    useEffect(() => { if (seciliAnakart && islemciPickerRef.current && !seciliIslemci) islemciPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliAnakart, seciliIslemci]);
    useEffect(() => { if (seciliIslemci && ramPickerRef.current && !seciliRam) ramPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliIslemci, seciliRam]);
    useEffect(() => { if (seciliRam && ekranKartiPickerRef.current && !seciliEkranKarti) ekranKartiPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliRam, seciliEkranKarti]);
    useEffect(() => { if (seciliEkranKarti && psuPickerRef.current && !seciliPsu) psuPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliEkranKarti, seciliPsu]);
    useEffect(() => { if (seciliPsu && kasaPickerRef.current && !seciliKasa) kasaPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliPsu, seciliKasa]);
    useEffect(() => { if (seciliKasa && cpuSogutucuPickerRef.current && !seciliCpuSogutucu) cpuSogutucuPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliKasa, seciliCpuSogutucu]);
    useEffect(() => { if (seciliCpuSogutucu && depolamaPickerRef.current && !seciliDepolama) depolamaPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliCpuSogutucu, seciliDepolama]);
    useEffect(() => { if (seciliDepolama && monitorPickerRef.current && !seciliMonitor) monitorPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliDepolama, seciliMonitor]);
    useEffect(() => { if (seciliMonitor && klavyePickerRef.current && !seciliKlavye) klavyePickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliMonitor, seciliKlavye]);
    useEffect(() => { if (seciliKlavye && farePickerRef.current && !seciliFare) farePickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliKlavye, seciliFare]);
    useEffect(() => { if (seciliFare && summaryRef.current) summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [seciliFare]);

    const steps = useMemo(() => [
        { key: 'anakart', label: 'Anakart', ref: anakartPickerRef, selected: !!seciliAnakart, enabled: true },
        { key: 'islemci', label: 'İşlemci', ref: islemciPickerRef, selected: !!seciliIslemci, enabled: !!seciliAnakart },
        { key: 'ram', label: 'RAM', ref: ramPickerRef, selected: !!seciliRam, enabled: !!seciliIslemci },
        { key: 'ekranKarti', label: 'Ekran Kartı', ref: ekranKartiPickerRef, selected: !!seciliEkranKarti, enabled: !!seciliRam },
        { key: 'psu', label: 'Güç Kaynağı', ref: psuPickerRef, selected: !!seciliPsu, enabled: !!seciliEkranKarti },
        { key: 'kasa', label: 'Kasa', ref: kasaPickerRef, selected: !!seciliKasa, enabled: !!seciliPsu },
        { key: 'sogutucu', label: 'CPU Soğutucu', ref: cpuSogutucuPickerRef, selected: !!seciliCpuSogutucu, enabled: !!seciliKasa },
        { key: 'depolama', label: 'Depolama', ref: depolamaPickerRef, selected: !!seciliDepolama, enabled: !!seciliCpuSogutucu },
        { key: 'monitor', label: 'Monitör', ref: monitorPickerRef, selected: !!seciliMonitor, enabled: !!seciliDepolama },
        { key: 'klavye', label: 'Klavye', ref: klavyePickerRef, selected: !!seciliKlavye, enabled: !!seciliMonitor },
        { key: 'fare', label: 'Fare', ref: farePickerRef, selected: !!seciliFare, enabled: !!seciliKlavye },
    ], [seciliAnakart, seciliIslemci, seciliRam, seciliEkranKarti, seciliPsu, seciliKasa, seciliCpuSogutucu, seciliDepolama, seciliMonitor, seciliKlavye, seciliFare]);

    const motionVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
    };

    return (
        <div className="App">
            <h1>Bilgisayar Toplama Uygulaması</h1>

            {(seciliAnakart || seciliIslemci || seciliRam || seciliEkranKarti || seciliPsu || seciliKasa || seciliDepolama || seciliMonitor || seciliKlavye || seciliFare || seciliCpuSogutucu) && (
                <div className="clear-selections-container">
                    <button onClick={handleClearAllSelections} className="clear-all-btn">
                        Tüm Seçimleri Temizle
                    </button>
                </div>
            )}

            {yukleniyor && <p>Parçalar yükleniyor...</p>}
            {hata && <p style={{ color: 'red', fontWeight: 'bold' }}>Hata: {hata}</p>}

            {!yukleniyor && !hata && parcalar && (
                <div className="app-container">

                    <main className="main-content">

                        <div ref={anakartPickerRef}>
                            <AnakartPicker anakartlar={parcalar.anakartlar} seciliAnakartId={seciliAnakart?.id} onAnakartSelect={handleAnakartSelect} />
                        </div>

                        <AnimatePresence>
                            {seciliAnakart && parcalar.islemciler && (
                                <motion.div ref={islemciPickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <IslemciPicker islemciler={parcalar.islemciler} seciliAnakart={seciliAnakart} seciliIslemciId={seciliIslemci?.id} onIslemciSelect={handleIslemciSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliIslemci && parcalar.ramlar && seciliAnakart && (
                                <motion.div ref={ramPickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <RamPicker ramlar={parcalar.ramlar} seciliAnakart={seciliAnakart} seciliRamId={seciliRam?.id} onRamSelect={handleRamSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliRam && parcalar.ekranKartlari && seciliAnakart && (
                                <motion.div ref={ekranKartiPickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <EkranKartiPicker ekranKartlari={parcalar.ekranKartlari} seciliAnakart={seciliAnakart} seciliEkranKartiId={seciliEkranKarti?.id} onEkranKartiSelect={handleEkranKartiSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliEkranKarti && parcalar.psular && seciliIslemci && (
                                <motion.div ref={psuPickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <PsuPicker psular={parcalar.psular} seciliIslemci={seciliIslemci} seciliEkranKarti={seciliEkranKarti} seciliPsuId={seciliPsu?.id} onPsuSelect={handlePsuSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliPsu && parcalar.kasalar && seciliAnakart && seciliEkranKarti && (
                                <motion.div ref={kasaPickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <KasaPicker kasalar={parcalar.kasalar} seciliAnakart={seciliAnakart} seciliEkranKarti={seciliEkranKarti} seciliPsu={seciliPsu} seciliKasaId={seciliKasa?.id} onKasaSelect={handleKasaSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliKasa && parcalar.islemciSogutuculari && seciliIslemci && (
                                <motion.div ref={cpuSogutucuPickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <CpuSogutucuPicker cpuSogutuculari={parcalar.islemciSogutuculari} seciliIslemci={seciliIslemci} seciliKasa={seciliKasa} seciliCpuSogutucuId={seciliCpuSogutucu?.id} onCpuSogutucuSelect={handleCpuSogutucuSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliCpuSogutucu && parcalar.depolamalar && seciliAnakart && (
                                <motion.div ref={depolamaPickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <DepolamaPicker depolamalar={parcalar.depolamalar} seciliAnakart={seciliAnakart} seciliDepolamaId={seciliDepolama?.id} onDepolamaSelect={handleDepolamaSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliDepolama && parcalar.monitorler && (
                                <motion.div ref={monitorPickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <MonitorPicker monitorler={parcalar.monitorler} seciliMonitorId={seciliMonitor?.id} onMonitorSelect={handleMonitorSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliMonitor && parcalar.klavyeler && (
                                <motion.div ref={klavyePickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <KlavyePicker klavyeler={parcalar.klavyeler} seciliKlavyeId={seciliKlavye?.id} onKlavyeSelect={handleKlavyeSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {seciliKlavye && parcalar.fareler && (
                                <motion.div ref={farePickerRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <FarePicker fareler={parcalar.fareler} seciliFareId={seciliFare?.id} onFareSelect={handleFareSelect} />
                                </motion.div>
                            )}
                        </AnimatePresence>


                        {/* --- Seçim Özeti Paneli (Alttaki) --- */}
                        <AnimatePresence>
                            {/* DÜZELTME: 'seciliFare' yerine 'seciliAnakart' yapıldı */}
                            {seciliAnakart && (
                                <motion.div ref={summaryRef} variants={motionVariants} initial="hidden" animate="visible" exit="exit">
                                    <div className="summary">
                                        <h2>Seçilen Parçalar</h2>
                                        {seciliAnakart ? <p><strong>Anakart:</strong> <span>{seciliAnakart.ad} ({seciliAnakart.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : <p>Anakart seçilmedi.</p>}
                                        {seciliIslemci ? <p><strong>İşlemci:</strong> <span>{seciliIslemci.ad} ({seciliIslemci.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliAnakart && <p>İşlemci seçilmedi.</p> )}
                                        {seciliRam ? <p><strong>RAM:</strong> <span>{seciliRam.ad} ({seciliRam.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliIslemci && <p>RAM seçilmedi.</p> )}
                                        {seciliEkranKarti ? <p><strong>Ekran Kartı:</strong> <span>{seciliEkranKarti.ad} ({seciliEkranKarti.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliRam && <p>Ekran Kartı seçilmedi.</p> )}
                                        {seciliKasa?.psu_tumlesik ? <p><strong>Güç Kaynağı:</strong> <span>Kasa ile Tümleşik</span></p> : (seciliPsu ? <p><strong>Güç Kaynağı:</strong> <span>{seciliPsu.ad} ({seciliPsu.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliEkranKarti && <p>Güç Kaynağı seçilmedi.</p> ))}
                                        {seciliKasa ? <p><strong>Kasa:</strong> <span>{seciliKasa.ad} ({seciliKasa.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliPsu && <p>Kasa seçilmedi.</p> )}
                                        {seciliCpuSogutucu ? <p><strong>CPU Soğutucu:</strong> <span>{seciliCpuSogutucu.ad} ({seciliCpuSogutucu.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliKasa && <p>CPU Soğutucu seçilmedi.</p> )}
                                        {seciliDepolama ? <p><strong>Depolama:</strong> <span>{seciliDepolama.ad} ({seciliDepolama.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliCpuSogutucu && <p>Depolama birimi seçilmedi.</p> )}
                                        {seciliMonitor ? <p><strong>Monitör:</strong> <span>{seciliMonitor.ad} ({seciliMonitor.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliDepolama && <p>Monitör seçilmedi.</p> )}
                                        {seciliKlavye ? <p><strong>Klavye:</strong> <span>{seciliKlavye.ad} ({seciliKlavye.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliMonitor && <p>Klavye seçilmedi.</p> )}
                                        {seciliFare ? <p><strong>Fare:</strong> <span>{seciliFare.ad} ({seciliFare.fiyat_try?.toLocaleString('tr-TR')} TRY)</span></p> : ( seciliKlavye && <p>Fare seçilmedi.</p> )}

                                        {/* Toplam Fiyat Gösterimi */}
                                        <p className="total-price">
                                            <span>Toplam Fiyat:</span> <span>{toplamFiyat.toLocaleString('tr-TR')} TRY</span>
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>

                    {/* Sağ Sütun (Yapışkan Sidebar) */}
                    <aside className="sidebar-summary">
                        <SelectionStatusSidebar steps={steps} />
                    </aside>

                </div>
            )}

            {!yukleniyor && !hata && !parcalar && (<p>Veriler yüklenemedi.</p>)}

            {/* Scroll-to-Top Butonu */}
            {showScrollTop && (
                <button
                    className="scroll-to-top-btn"
                    onClick={scrollToTop}
                    title="Yukarı Çık"
                >
                    ↑
                </button>
            )}
        </div>
    );
}

export default App;