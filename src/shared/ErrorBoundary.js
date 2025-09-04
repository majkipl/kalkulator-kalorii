// /src/shared/ErrorBoundary.js

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error) {
        // Zaktualizuj stan, aby następny render pokazał UI awaryjne.
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        // Możesz także zalogować błąd do zewnętrznej usługi
        console.error("ErrorBoundary złapał błąd:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Możesz wyrenderować dowolny interfejs awaryjny
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-4">
                    <h1 className="text-2xl font-bold">Coś poszło nie tak.</h1>
                    <p>Spróbuj odświeżyć stronę.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;