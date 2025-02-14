const LogLevel = {
    Info: 'info',
    Warning: 'warning',
    Error: 'error',
    Debug: 'debug',
};

function getDatetime() {
    // Example output: 2024-01-23T14:35:27
    const today = new Date();
    return today.toISOString().slice(0, 19).replace('Z', '');
}

module.exports = {
    log: function log(message, level = 'info') {
        const logMethod = console[level];
        if (logMethod) {
            logMethod(`${getDatetime()} | ${message}`);
        }
    },
    LogLevel: LogLevel,
    getDatetime: getDatetime
}