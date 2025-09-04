// /src/__tests__/utils/calculateDer.test.js

import calculateDer from '../../utils/calculateDer';

describe('calculateDer', () => {
    // Profil bazowy dla dorosłego, kastrowanego kota
    const baseCatProfile = {
        currentWeight: 4, // kg
        targetWeight: 4,
        age: 3, // lata
        isNeutered: true,
        activityLevel: 'umiarkowany',
        physiologicalState: 'normalny',
        chronicDisease: 'brak',
        breed: 'mieszany',
    };

    test('powinien zwrócić 0 dla nieprawidłowej wagi lub braku profilu', () => {
        expect(calculateDer(null)).toBe(0);
        expect(calculateDer({...baseCatProfile, currentWeight: 0})).toBe(0);
    });

    test('powinien poprawnie obliczyć DER dla standardowego, dorosłego kastrata', () => {
        // RER = 70 * (4^0.75) ≈ 197.99
        // DER = 197.99 * 1.2 (kastrat) * 1.0 (rasa) = 237.58 -> zaokrąglone do 238
        expect(calculateDer(baseCatProfile)).toBe(238);
    });

    test('powinien zastosować modyfikator odchudzania (0.8)', () => {
        const overweightCat = {...baseCatProfile, currentWeight: 5, targetWeight: 4};
        // RER (bazujący na wadze docelowej 4kg) ≈ 197.99
        // DER = 197.99 * 0.8 * 1.0 = 158.39 -> zaokrąglone do 158
        expect(calculateDer(overweightCat)).toBe(158);
    });

    test('powinien poprawnie obliczyć DER dla kociaka (< 1 rok)', () => {
        const kitten = {...baseCatProfile, age: 0.5};
        // RER ≈ 197.99
        // DER = 197.99 * 2.5 * 1.0 = 494.97 -> zaokrąglone do 495
        expect(calculateDer(kitten)).toBe(495);
    });

    test('powinien zastosować modyfikator rasy dla Sfinksa (1.2)', () => {
        const sphynxCat = {...baseCatProfile, breed: 'sfinks'};
        // RER ≈ 197.99
        // DER = 197.99 * 1.2 (kastrat) * 1.2 (rasa) = 285.1 -> zaokrąglone do 285
        expect(calculateDer(sphynxCat)).toBe(285);
    });

    test('powinien priorytetyzować modyfikator choroby przewlekłej (np. nadczynność tarczycy * 1.5)', () => {
        const sickCat = {...baseCatProfile, age: 10, chronicDisease: 'nadczynnosc_tarczycy'};
        // RER ≈ 197.99
        // DER = 197.99 * 1.5 * 1.0 = 296.98 -> zaokrąglone do 297
        expect(calculateDer(sickCat)).toBe(297);
    });
});