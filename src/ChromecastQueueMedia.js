const ChromecastMedia = require('./ChromecastMedia');

class ChromecastQueueMedia {

  constructor(queueMedia) {

    if (!queueMedia.media) {
      throw new TypeError('Media must be defined');
    }

    this.autoplay = queueMedia.autoplay !== undefined ? queueMedia.autoplay : true;
    this.preloadTime = queueMedia.preloadTime !== undefined ? queueMedia.preloadTime : 3;
    this.startTime = queueMedia.startTime;
    this.activeTrackIds = [];
    this.playbackDuration = queueMedia.playbackDuration;
    this.media = new ChromecastMedia(queueMedia.media);
  }
}

module.exports = ChromecastQueueMedia;
