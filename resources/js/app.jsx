import '../css/app.css';
import './bootstrap';
import Echo from 'laravel-echo';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';

import LoadingSpinner from './Components/LoadingSpinner'; // Import your spinner

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const MainApp = () => {
            const [loading, setLoading] = useState(false);

            useEffect(() => {
                router.on('start', () => setLoading(true));
                router.on('finish', () => setLoading(false));
                router.on('cancel', () => setLoading(false));
                router.on('error', () => setLoading(false));
            }, []);

            return (
                <>
                    {loading && <LoadingSpinner />}
                    <App {...props} />
                </>
            );
        };

        root.render(<MainApp />);
    },
    // progress: {
    //     color: '#06cc45ff',
    // },
});

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '30bdcedd3c7074253103',
    cluster: 'ap1',
    forceTLS: true
});