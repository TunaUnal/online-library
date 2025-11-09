import { EventEmitter } from "events";
const eventEmitter = new EventEmitter();

// Event limitini artır (default 10’dur)
eventEmitter.setMaxListeners(50);

export default eventEmitter;
