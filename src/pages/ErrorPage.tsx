// src/pages/ErrorPage.tsx
import { useRouteError } from 'react-router-dom';

const ErrorPage = () => {
    const error: any = useRouteError();

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-16">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600">
                {error.statusText || error.message || 'Please try again later.'}
            </p>
            <p className="text-gray-500 mt-2">Status code: {error.status}</p>
        </div>
    );
};

export default ErrorPage;