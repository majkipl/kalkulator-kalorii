/**
 * Formatuje wiek kota (w latach) na czytelny tekst.
 * @param {number | null | undefined} age - Wiek kota w formacie dziesiętnym.
 * @returns {string} Sformatowany tekst.
 */
const formatAgeText = (age) => {
    if (!age && age !== 0) return 'Brak danych';
    if (age < 1) {
        const months = Math.round(age * 12);
        return `${months} mies. (Kocię)`;
    }
    const years = Math.floor(age);
    if (years > 7) return `${years} lat (Senior)`;
    return `${years} lat (Dorosły)`;
};

export default formatAgeText;