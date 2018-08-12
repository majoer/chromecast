const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
const log = require('node-log')(__filename);
const EventEmitter = require('events');
const ErrorCode = require('./ErrorCode');

class Chromecast extends EventEmitter {

  constructor(options) {
    super();
    this.options = options;

    this.client = new Client();
    this.connected = false;
    this.closing = false;

    this.setUpClientListeners();
    this.connect().then(() => {
      this.connected = true;
      log(`Connected to ${this.options.name}`);

      return this.joinIfSessionExists().then(player => {
        this.player = player;
        this.player.on('status', (status) => {
          this.emit('status-player', status);
        });

        this.player.on('error', (err) => {
          log('PlayerError', err);
        });
      }).catch(() => {
        log('No existing session found');
      });
    }).catch(err => {
      log(err);
    });
  }

  setUpClientListeners() {
    this.client.client.on('close', () => {
      const closedUnexpectedly = this.connected && !this.closing;
      this.connected = false;
      this.closing = false;


      if (closedUnexpectedly) {
        log('Client closed unexpectedly');
        this.reconnect();
      } else {
        log('Client closed');
      }
    });

    this.client.on('status', (status) => {
      log('status', status);
      this.emit('status-client', status);
    });

    this.client.on('error', (error) => {
      log('error', error);
    });
  }

  joinIfSessionExists() {
    return this.getSessions().then(sessions => {
      const existingSession = sessions.find(session => session.displayName === 'Default Media Receiver');

      if (existingSession) {
        log('Joining existing session');
        return this.join(existingSession);
      }

      return Promise.reject();
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client.once('error', reject);
      this.client.connect(this.options.host, () => {
        this.client.off('error', reject);
        resolve();
      });
    });
  }

  reconnect() {
    this.connect().then(this.joinIfSessionExists);
  }

  close() {
    this.closing = true;
    this.client.close();
  }

  getSessions() {
    return new Promise((resolve, reject) => {
      this.client.getSessions((err, sessions) => {
        if (err) {
          reject(err);
        } else {
          resolve(sessions);
        }
      });
    });
  }

  join(session) {
    return new Promise((resolve, reject) => {
      this.client.join(session, DefaultMediaReceiver, (err, player) => {
        if (err) {
          reject(err);
        } else {
          resolve(player);
        }
      });
    });
  }

  getClientStatus() {
    return new Promise((resolve, reject) => {
      this.client.getStatus((err, status) => {
        if (err) {
          log(err);
          reject(ErrorCode.CHROMECAST.COULD_NOT_GET_CLIENT_STATUS)
        } else {
          resolve(status);
        }
      })
    });
  }

  getPlayerStatus() {
    return new Promise((resolve, reject) => {
      if (!this.player) {
        reject(ErrorCode.CHROMECAST.NOTHING_IS_PLAYING);
      } else {
        this.player.getStatus((err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_GET_PLAYER_STATUS)
          } else {
            resolve(status);
          }
        })
      }
    });
  }

  launch() {
    return new Promise((resolve, reject) => {
      if (this.player) {
        resolve(this.player);
      } else {
        this.client.launch(DefaultMediaReceiver, (err, player) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_LAUNCH);
          } else {
            this.player = player;
            resolve(player);
          }
        });
      }
    });
  }

  load(chromecastMedia) {
    return this.launch().then(player => {
      return new Promise((resolve, reject) => {
        player.load(chromecastMedia, { autoplay: true }, (err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_LOAD);
          } else {
            this.player.on('status', (status) => {
              this.emit('status-player', status);
            });
            this.player.on('error', (err) => {
              log('PlayerError', err);
            });
            resolve(status);
          }
        });
      });
    });
  }

  queueLoad(chromecastMediaList, repeat) {
    const options = {
      startIndex: 1,
      repeatMode: repeat ? 'REPEAT_ON' : 'REPEAT_OFF'
    };

    return this.launch().then(player => {
      return new Promise((resolve, reject) => {
        player.queueLoad(chromecastMediaList, options, (err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_QUEUE_LOAD);
          } else {
            resolve(status);
          }
        });
      });
    });
  }

  queueInsert(chromecastMediaList) {
    return this.launch().then(player => {
      return new Promise((resolve, reject) => {
        player.queueInsert(chromecastMediaList, (err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_QUEUE_INSERT);
          } else {
            resolve(status);
          }
        });
      });
    });
  }

  queueReorder(itemIds) {
    return this.launch().then(player => {
      return new Promise((resolve, reject) => {
        player.queueReorder(itemIds, {}, (err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_QUEUE_REORDER);
          } else {
            resolve(status);
          }
        });
      });
    });
  }

  queueRemove(items) {
    return this.launch().then(player => {
      return new Promise((resolve, reject) => {
        player.queueRemove(items, { currentItemId: 0 }, (err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_QUEUE_REMOVE);
          } else {
            resolve(status);
          }
        });
      });
    });
  }

  play() {
    return new Promise((resolve, reject) => {
      if (!this.player) {
        reject(ErrorCode.CHROMECAST.NOTHING_IS_PLAYING);
      } else {
        this.player.play((err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_PLAY)
          } else {
            resolve(status);
          }
        })
      }
    });
  }

  pause() {
    return new Promise((resolve, reject) => {
      if (!this.player) {
        reject(ErrorCode.CHROMECAST.NOTHING_IS_PLAYING);
      } else {
        this.player.pause((err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_PAUSE)
          } else {
            resolve(status);
          }
        })
      }
    });
  }

  seek(newTimeInSeconds) {
    return new Promise((resolve, reject) => {
      if (!this.player) {
        reject(ErrorCode.CHROMECAST.NOTHING_IS_PLAYING);
      } else {
        this.player.seek(newTimeInSeconds, (err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_SEEK)
          } else {
            resolve(status);
          }
        })
      }
    });
  }

  mutePlayer() {
    return new Promise((resolve, reject) => {
      if (!this.player) {
        reject(ErrorCode.CHROMECAST.NOTHING_IS_PLAYING);
      } else {
        this.player.mute((err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_MUTE_PLAYER)
          } else {
            resolve(status);
          }
        })
      }
    });
  }

  unmutePlayer() {
    return new Promise((resolve, reject) => {
      if (!this.player) {
        reject(ErrorCode.CHROMECAST.NOTHING_IS_PLAYING);
      } else {
        this.player.unmute((err, status) => {
          if (err) {
            log(err);
            reject(ErrorCode.CHROMECAST.COULD_NOT_UNMUTE_PLAYER)
          } else {
            resolve(status);
          }
        })
      }
    });
  }

  setVolume(volume) {
    return new Promise((resolve, reject) => {
      this.client.setVolume(volume, (err, volume) => {
        if (err) {
          log(err);
          reject(ErrorCode.CHROMECAST.COULD_NOT_SET_VOLUME);
        } else {
          resolve(volume);
        }
      })
    });
  }

  mute() {
    return new Promise((resolve, reject) => {
      this.client.setVolume({ muted: true }, (err, volume) => {
        if (err) {
          log(err);
          reject(ErrorCode.CHROMECAST.COULD_NOT_MUTE);
        } else {
          resolve(volume);
        }
      })
    });
  }

  unmute() {
    return new Promise((resolve, reject) => {
      this.client.setVolume({ muted: false }, (err, volume) => {
        if (err) {
          log(err);
          reject(ErrorCode.CHROMECAST.COULD_NOT_UNMUTE);
        } else {
          resolve(volume);
        }
      })
    });
  }
}

module.exports = Chromecast;
