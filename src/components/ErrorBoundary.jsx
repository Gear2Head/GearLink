import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-900 text-white h-screen overflow-auto flex flex-col justify-center items-center text-center">
                    <h1 className="text-2xl font-bold mb-4">Üzgünüz, bir hata oluştu 😔</h1>
                    <p className="mb-6">Uygulama beklenmedik bir hatayla karşılaştı.</p>

                    <div className="w-full max-w-md bg-black/50 p-4 rounded-lg text-left text-xs font-mono overflow-auto max-h-60 mb-6 border border-red-700">
                        <p className="text-red-300 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                        <pre className="text-gray-400">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </div>

                    <button
                        className="px-6 py-3 bg-white text-red-900 font-bold rounded-full hover:bg-gray-200 transition"
                        onClick={() => window.location.reload()}
                    >
                        Uygulamayı Yeniden Başlat
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
