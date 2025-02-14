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
        switch (level) {
            case LogLevel.Info:
                console.log(`${getDatetime()} | ${message}`);
                break;
            case LogLevel.Warn:
                console.warn(`${getDatetime()} | ${message}`);
                break;
            case LogLevel.Error:
                console.error(`${getDatetime()} | ${message}`);
                break;
            case LogLevel.Debug:
                console.debug(`${getDatetime()} | ${message}`);
                break;
        }
    },
    LogLevel: LogLevel,
    getDatetime: getDatetime
}