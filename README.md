## Chromecast

Promise-based wrapper for https://github.com/thibauts/node-castv2-client

#### Usage

```
var chromecast = new Chromecast({
    id: '', // The ID of your chromecast
    name: '' // The name of your chromecast,
    host: '' // The IP-address of your chromecast,
    port: 8009, // The port of your chromecast, typically 8009
    type: 'Chromecast' // Type of chromecast device
});

```

#### Events

E.g: `chromecast.on('event-name', () => ...);`

- status-player
- status-client
