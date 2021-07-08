const EventEmitter = require('events');
const socketEventEmitter = new EventEmitter();
const storageHooksEventEmitter = new EventEmitter();

exports.socketEventEmitter = socketEventEmitter;
exports.SHooksEventEmitter = storageHooksEventEmitter;