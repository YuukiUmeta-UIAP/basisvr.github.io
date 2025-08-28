tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
            colors: {
                brand: {
                    DEFAULT: '#ef1237',
                    100: '#ffd6de',
                    300: '#ff5775',
                    500: '#ef1237',
                    700: '#950a24'
                },
                basisbg: '#100f27'
            },
            boxShadow: {
                soft: '0 8px 30px rgba(0,0,0,0.08)'
            }
        }
    },
    darkMode: 'class'
};

(function () {
    const stored = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (systemDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
})();