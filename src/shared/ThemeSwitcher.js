// /src/shared/ThemeSwitcher.js

import React from 'react';
import {LucideSun, LucideMoon, LucideLaptop} from 'lucide-react';

const ThemeSwitcher = ({theme, setTheme}) => {
    const themes = [
        {name: 'light', icon: LucideSun},
        {name: 'dark', icon: LucideMoon},
        {name: 'system', icon: LucideLaptop},
    ];

    return (
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            {themes.map(t => (
                <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`p-2 rounded-md transition-colors ${theme === t.name ? 'bg-white dark:bg-gray-900 text-indigo-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    aria-label={`Switch to ${t.name} theme`}
                >
                    <t.icon size={16}/>
                </button>
            ))}
        </div>
    );
};

export default React.memo(ThemeSwitcher);