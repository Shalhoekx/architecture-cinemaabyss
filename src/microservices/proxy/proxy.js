const http = require('http');
const { createProxy } = require('http-proxy');

// Создаем прокси-сервер
const proxy = createProxy();

// Конфигурация из переменных окружения
const PORT = process.env.PORT || 8080;
const TARGET = process.env.TARGET || 'http://example.com';
const MONOLITH_URL = process.env.MONOLITH_URL;
const MOVIES_SERVICE_URL = process.env.MOVIES_SERVICE_URL;
const EVENTS_SERVICE_URL = process.env.MOVIES_SERVICE_URL;
const GRADUAL_MIGRATION = process.env.GRADUAL_MIGRATION;
const MOVIES_MIGRATION_PERCENT = process.env.MOVIES_MIGRATION_PERCENT;

// Создаем HTTP-сервер
const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    const target = GetTarget(req);
    // Проксирование запроса
    proxy.web(req, res, { 
        target: target,
        changeOrigin: true 
    });
});

// Обработка ошибок
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error occurred');
});

server.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
    console.log(`Forwarding requests to: ${TARGET}`);
});

function GetTarget(req) {
    if (!(GRADUAL_MIGRATION === "true"))
        return MONOLITH_URL;

    const path = req.url;

    if (Math.random() > MOVIES_MIGRATION_PERCENT / 100)
        return MONOLITH_URL;

    if (path.startsWith("/api/movies"))
        return MOVIES_SERVICE_URL;

    if (path.startsWith("/api/events"))
        return EVENTS_SERVICE_URL;

    return MONOLITH_URL;
}