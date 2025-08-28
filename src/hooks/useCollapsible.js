// /src/hooks/useCollapsible.js

import { useState } from 'react';

/**
 * Customowy hook do zarządzania zwijanymi sekcjami.
 * @param {boolean} initialState - Początkowy stan (otwarty/zamknięty).
 * @returns {{isOpen: boolean, triggerProps: object, contentProps: object}}
 */
const useCollapsible = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);

    // Właściwości dla elementu, który wyzwala zwijanie/rozwijanie
    const triggerProps = {
        onClick: () => setIsOpen(!isOpen),
        role: 'button',
        'aria-expanded': isOpen,
        className: "flex justify-between items-center cursor-pointer lg:cursor-auto"
    };

    // Właściwości dla kontenera z treścią
    const contentProps = {
        className: `grid transition-all duration-300 ease-in-out lg:grid-rows-[1fr] lg:opacity-100 ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`
    };

    return { isOpen, triggerProps, contentProps };
};

export default useCollapsible;