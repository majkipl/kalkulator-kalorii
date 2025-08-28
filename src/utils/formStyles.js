// /src/utils/formStyles.js

const inputBase = "block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm";
const buttonBase = "w-full flex items-center justify-center font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50";

// Definicje wariantów kolorystycznych
const buttonPrimaryClasses = "bg-indigo-500 hover:bg-indigo-600 text-white";
const buttonSecondaryClasses = "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200";
const buttonDestructiveClasses = "bg-red-500 hover:bg-red-600 text-white";
const buttonSuccessClasses = "bg-green-500 hover:bg-green-600 text-white h-10";
const buttonTertiaryClasses = "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80";
const buttonGoogleClasses = "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600";

export const formStyles = {
    // Style dla pól tekstowych
    input: `${inputBase} min-h-[38px] px-3`,
    textarea: `${inputBase} px-3 py-2`,

    // Style dla przycisków (podstawowe)
    buttonPrimary: `${buttonBase} ${buttonPrimaryClasses}`,
    buttonSecondary: `${buttonBase} ${buttonSecondaryClasses}`,
    buttonDestructive: `${buttonBase} ${buttonDestructiveClasses}`,
    buttonSuccess: `${buttonBase} ${buttonSuccessClasses}`,
    buttonTertiary: `${buttonBase} ${buttonTertiaryClasses}`,
    buttonGoogle: `${buttonBase} ${buttonGoogleClasses}`,

    // --- NOWE ALIASY SEMANTYCZNE ---
    buttonSubmit: `${buttonBase} ${buttonPrimaryClasses}`, // Przycisk zatwierdzający (Submit) jest aliasem stylu Primary
    buttonCancel: `${buttonBase} ${buttonSecondaryClasses}`, // Przycisk anulujący (Cancel) jest aliasem stylu Secondary
};

// Funkcja generująca style dla react-select (bez zmian)
export const getCustomSelectStyles = (isDark) => ({
    control: (provided, state) => ({
        ...provided,
        backgroundColor: isDark ? '#374151' : '#FFFFFF',
        borderColor: isDark ? '#4B5563' : '#D1D5DB',
        minHeight: '38px',
        fontSize: '0.875rem',
        boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : null,
        '&:hover': {
            borderColor: state.isFocused ? '#6366F1' : (isDark ? '#6B7280' : '#A5B4FC'),
        },
        transition: 'border-color 0.2s ease-in-out',
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        zIndex: 50,
        fontSize: '0.875rem',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? (isDark ? '#4F46E5' : '#6366F1')
            : state.isFocused
                ? (isDark ? '#374151' : '#E5E7EB')
                : 'transparent',
        color: isDark ? '#E5E7EB' : '#111827',
        ':active': {
            ...provided[':active'],
            backgroundColor: !state.isDisabled
                ? (isDark ? '#4338CA' : '#4F46E5')
                : undefined,
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: isDark ? '#E5E7EB' : '#111827',
    }),
    input: (provided) => ({
        ...provided,
        color: isDark ? '#E5E7EB' : '#111827',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: isDark ? '#9CA3AF' : '#6B7280',
    }),
});