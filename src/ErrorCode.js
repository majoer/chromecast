let counter = 0;

class ErrorCode {
  constructor(message) {
    this.code = ++counter;
    this.message = message;
  }

  is(code) {
    return this.code === code;
  }
}

module.exports = {
  NOTHING_IS_PLAYING: new ErrorCode('Can\'t play, nothing is playing'),
  COULD_NOT_LAUNCH: new ErrorCode('Could not launch DefaultMediaReceiver'),
  COULD_NOT_LOAD: new ErrorCode('Could not load url'),
  COULD_NOT_SET_VOLUME: new ErrorCode('Could not set volume'),
  COULD_NOT_MUTE: new ErrorCode('Could not mute'),
  COULD_NOT_UNMUTE: new ErrorCode('Could not unmute'),
  COULD_NOT_SEEK: new ErrorCode('Could not seek'),
  COULD_NOT_PAUSE: new ErrorCode('Could not pause'),
  COULD_NOT_PLAY: new ErrorCode('Could not play'),
  COULD_NOT_MUTE_PLAYER: new ErrorCode('Could not mute player'),
  COULD_NOT_UNMUTE_PLAYER: new ErrorCode('Could not unmute player'),
  COULD_NOT_QUEUE_LOAD: new ErrorCode('Could not load queue'),
  COULD_NOT_QUEUE_INSERT: new ErrorCode('Could not insert into queue'),
  COULD_NOT_QUEUE_REMOVE: new ErrorCode('Could not remove from queue'),
  COULD_NOT_QUEUE_REORDER: new ErrorCode('Could not reorder queue')
};