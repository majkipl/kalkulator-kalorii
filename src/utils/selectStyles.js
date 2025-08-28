// /**
//  * Generuje niestandardowe style dla komponentu Select.
//  * @param {boolean} isDark - Czy włączony jest tryb ciemny.
//  * @returns {object} Obiekt stylów dla react-select.
//  */
// const getCustomSelectStyles = (isDark) => ({
//     control: (provided, state) => ({
//         ...provided,
//         backgroundColor: isDark ? '#374151' : '#FFFFFF',
//         borderColor: isDark ? '#4B5563' : '#D1D5DB',
//         minHeight: '38px',
//         fontSize: '0.875rem',
//         boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : null,
//         '&:hover': {
//             borderColor: state.isFocused ? '#6366F1' : (isDark ? '#6B7280' : '#A5B4FC'),
//         },
//         transition: 'border-color 0.2s ease-in-out',
//     }),
//     menu: (provided) => ({
//         ...provided,
//         backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
//         zIndex: 50,
//         fontSize: '0.875rem',
//     }),
//     option: (provided, state) => ({
//         ...provided,
//         backgroundColor: state.isSelected
//             ? (isDark ? '#4F46E5' : '#6366F1')
//             : state.isFocused
//                 ? (isDark ? '#374151' : '#E5E7EB')
//                 : 'transparent',
//         color: isDark ? '#E5E7EB' : '#111827',
//         ':active': {
//             ...provided[':active'],
//             backgroundColor: !state.isDisabled
//                 ? (isDark ? '#4338CA' : '#4F46E5')
//                 : undefined,
//         },
//     }),
//     singleValue: (provided) => ({
//         ...provided,
//         color: isDark ? '#E5E7EB' : '#111827',
//     }),
//     input: (provided) => ({
//         ...provided,
//         color: isDark ? '#E5E7EB' : '#111827',
//     }),
//     placeholder: (provided) => ({
//         ...provided,
//         color: isDark ? '#9CA3AF' : '#6B7280',
//     }),
// });
//
// export default getCustomSelectStyles;