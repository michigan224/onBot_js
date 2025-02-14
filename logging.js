const LogLevel = {
    Info: 'info',
    Warning: 'warning',
    Error: 'error',
    Debug: 'debug',
};

function getDatetime() {
    const today = new Date();
    const date =
        today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time =
        today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const dateTime = date + 'T' + time;
    return dateTime;
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