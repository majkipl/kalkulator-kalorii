// /src/shared/FormError.js

import React from 'react';

/**
 * Komponent do wyświetlania komunikatu o błędzie walidacji formularza.
 * @param {{message: string}} props
 */
const FormError = ({message}) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1" role="alert">{message}</p>;
};

export default FormError;