import React, {useEffect} from 'react';
import {LucideCheckCircle, LucideAlertCircle, LucideX} from 'lucide-react';

const Toast = ({message, type, onClose}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseStyle = "fixed top-20 right-5 p-4 rounded-lg shadow-lg flex items-center text-white transition-opacity duration-300 z-50";
    const typeStyles = {
        success: "bg-green-500",
        error: "bg-red-500"
    };

    return (
        <div className={`${baseStyle} ${typeStyles[type]}`}>
            {type === 'success' ? <LucideCheckCircle className="mr-3"/> : <LucideAlertCircle className="mr-3"/>}
            {message}
            <button onClick={onClose} className="ml-4 font-bold">
                <LucideX size={20}/>
            </button>
        </div>
    );
};

export default Toast;