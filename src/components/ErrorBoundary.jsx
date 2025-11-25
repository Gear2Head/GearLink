import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen flex items-center justify-center bg-dark-bg text-white p-4">
                    <div className="text-center max-w-md">
                        <h1 className="text-2xl font-bold mb-4 text-red-400">Bir Hata Oluştu</h1>
                        <p className="text-gray-400 mb-4">
                            {this.state.error?.message || 'Beklenmeyen bir hata oluştu.'}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg"
                        >
                            Yeniden Dene
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

