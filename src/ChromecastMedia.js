class ChromecastMedia {
  constructor(media) {

    if (!media.metadata) {
      throw new TypeError('metadata must be defined');
    }

    this.contentId = media.contentId;
    this.contentType = media.contentType;
    this.streamType = 'BUFFERED';
    this.metadata = {
      title: media.metadata.title,
      metadataType: 4  // Todo: Figure out what this means
    };
  }
}

module.exports = ChromecastMedia;
