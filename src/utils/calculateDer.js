// /src/utils/calculateDer.js

/**
 * Oblicza dzienne zapotrzebowanie energetyczne (DER) dla kota.
 * @param {object} catProfile - Obiekt z danymi profilu kota.
 * @returns {number} Obliczona wartość DER w kcal.
 */
const calculateDer = (catProfile) => {
    if (!catProfile) return 0;
    const weight = catProfile.targetWeight > 0 ? catProfile.targetWeight : catProfile.currentWeight;
    if (weight <= 0) return 0;

    // Resting Energy Requirement (RER)
    const rer = 70 * Math.pow(weight, 0.75);
    let finalDer;

    // Modyfikator dla chorób przewlekłych
    switch (catProfile.chronicDisease) {
        case 'nadczynnosc_tarczycy':
            finalDer = rer * 1.5;
            break;
        case 'choroba_nerek':
            finalDer = rer * 1.0;
            break;
        case 'cukrzyca':
            finalDer = rer * 1.2;
            break;
        case 'choroby_serca':
            finalDer = rer * 1.3;
            break;
        case 'choroby_drog_moczowych':
            finalDer = rer * 0.8;
            break;
        case 'zapalenie_trzustki':
            finalDer = rer * 1.1;
            break;
        case 'nieswoiste_zapalenie_jelit':
            finalDer = rer * 1.2;
            break;
        case 'brak':
        default:
            // Modyfikator dla stanu fizjologicznego
            switch (catProfile.physiologicalState) {
                case 'ciaza':
                    finalDer = rer * 2.0;
                    break;
                case 'laktacja':
                    finalDer = rer * 3.5;
                    break;
                case 'rekonwalescencja':
                    finalDer = rer * 1.3;
                    break;
                case 'normalny':
                default:
                    const age = catProfile.age || 1;
                    let modifier;

                    if (age < 0.33) {
                        modifier = 3.0;
                    } else if (age < 1) {
                        modifier = 2.5;
                    } else if (age > 7) {
                        modifier = catProfile.isNeutered ? 1.0 : 1.2;
                    } else {
                        modifier = catProfile.isNeutered ? 1.2 : 1.4;
                    }

                    if (catProfile.currentWeight > catProfile.targetWeight && catProfile.targetWeight > 0) {
                        modifier = 0.8; // Redukcja wagi
                    } else if (catProfile.currentWeight < catProfile.targetWeight && catProfile.targetWeight > 0) {
                        modifier = 1.4; // Zwiększenie wagi
                    } else {
                        if (catProfile.activityLevel === 'wysoki') modifier *= 1.2;
                        if (catProfile.activityLevel === 'niski') modifier *= 0.8;
                    }
                    finalDer = rer * modifier;
            }
    }

    // Modyfikator dla rasy
    let breedModifier = 1.0;
    switch (catProfile.breed) {
        case 'sfinks':
            breedModifier = 1.2;
            break;
        case 'bengalski':
            breedModifier = 1.1;
            break;
        case 'brytyjski':
            breedModifier = 0.95;
            break;
        case 'ragdoll':
            breedModifier = 0.95;
            break;
        default:
            breedModifier = 1.0;
    }

    return Math.round(finalDer * breedModifier);
};

export default calculateDer;