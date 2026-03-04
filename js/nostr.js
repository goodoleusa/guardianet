(function() {
  'use strict';

  const RELAYS = [
    'wss://relay.damus.io',
    'wss://relay.nostr.info',
    'wss://nostr-pub.wellorder.net'
  ];
  const CHANNEL_TAG = '#gn-v2';
  const LS_KEY_SK = 'mdd_nostr_sk';
  const LS_KEY_PK = 'mdd_nostr_pk';

  let sockets = {};
  let subscriptions = {};
  let eventHandlers = [];
  let connectionStatus = {};
  let privateKey = null;
  let publicKey = null;
  let subIdCounter = 0;

  function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return bytesToHex(new Uint8Array(hashBuffer));
  }

  async function generateKeypair() {
    const sk = crypto.getRandomValues(new Uint8Array(32));
    const skHex = bytesToHex(sk);
    const pkHex = await derivePublicKey(skHex);
    return { sk: skHex, pk: pkHex };
  }

  async function derivePublicKey(skHex) {
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        hexToBytes(skHex),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('nostr-keygen'));
      return bytesToHex(new Uint8Array(sig));
    } catch (e) {
      let hash = skHex;
      for (let i = 0; i < 3; i++) {
        hash = await sha256(hash + 'nostr-pubkey-' + i);
      }
      return hash;
    }
  }

  async function getEventId(event) {
    const serialized = JSON.stringify([
      0,
      event.pubkey,
      event.created_at,
      event.kind,
      event.tags,
      event.content
    ]);
    return await sha256(serialized);
  }

  async function signEvent(event) {
    const id = await getEventId(event);
    event.id = id;
    const sigData = id + privateKey;
    event.sig = await sha256(sigData + 'nostr-sig-v1');
    return event;
  }

  function loadKeys() {
    privateKey = localStorage.getItem(LS_KEY_SK);
    publicKey = localStorage.getItem(LS_KEY_PK);
    return !!(privateKey && publicKey);
  }

  function saveKeys(sk, pk) {
    privateKey = sk;
    publicKey = pk;
    localStorage.setItem(LS_KEY_SK, sk);
    localStorage.setItem(LS_KEY_PK, pk);
  }

  function connectRelay(url) {
    if (sockets[url] && sockets[url].readyState <= 1) return;

    connectionStatus[url] = 'connecting';
    dispatchStatusUpdate();

    try {
      const ws = new WebSocket(url);
      sockets[url] = ws;

      ws.onopen = function() {
        connectionStatus[url] = 'connected';
        dispatchStatusUpdate();
        Object.values(subscriptions).forEach(function(sub) {
          sendSubscription(url, sub);
        });
      };

      ws.onmessage = function(e) {
        try {
          const msg = JSON.parse(e.data);
          if (msg[0] === 'EVENT' && msg[2]) {
            eventHandlers.forEach(function(h) { h(msg[2], url); });
          } else if (msg[0] === 'EOSE') {
            // end of stored events
          } else if (msg[0] === 'OK') {
            // event accepted
          }
        } catch (err) {}
      };

      ws.onerror = function() {
        connectionStatus[url] = 'error';
        dispatchStatusUpdate();
      };

      ws.onclose = function() {
        connectionStatus[url] = 'disconnected';
        dispatchStatusUpdate();
        setTimeout(function() { connectRelay(url); }, 10000);
      };
    } catch (e) {
      connectionStatus[url] = 'error';
      dispatchStatusUpdate();
    }
  }

  function sendSubscription(relayUrl, sub) {
    const ws = sockets[relayUrl];
    if (!ws || ws.readyState !== 1) return;
    try {
      ws.send(JSON.stringify(['REQ', sub.id, sub.filter]));
    } catch (e) {}
  }

  function subscribe(filter) {
    const id = 'mdd_' + (++subIdCounter);
    const sub = { id: id, filter: filter };
    subscriptions[id] = sub;
    Object.keys(sockets).forEach(function(url) {
      sendSubscription(url, sub);
    });
    return id;
  }

  async function publish(kind, content, extraTags) {
    if (!privateKey || !publicKey) return null;

    var event = {
      pubkey: publicKey,
      created_at: Math.floor(Date.now() / 1000),
      kind: kind,
      tags: [['t', 'gn-v2']].concat(extraTags || []),
      content: content
    };

    event = await signEvent(event);

    var sent = 0;
    Object.values(sockets).forEach(function(ws) {
      if (ws.readyState === 1) {
        try {
          ws.send(JSON.stringify(['EVENT', event]));
          sent++;
        } catch (e) {}
      }
    });

    return { event: event, relays: sent };
  }

  function onEvent(handler) {
    eventHandlers.push(handler);
  }

  function dispatchStatusUpdate() {
    var connected = 0;
    var total = Object.keys(connectionStatus).length;
    Object.values(connectionStatus).forEach(function(s) {
      if (s === 'connected') connected++;
    });
    window.dispatchEvent(new CustomEvent('nostr-status', {
      detail: { connected: connected, total: total, relays: Object.assign({}, connectionStatus) }
    }));
  }

  function getStatus() {
    var connected = 0;
    Object.values(connectionStatus).forEach(function(s) {
      if (s === 'connected') connected++;
    });
    return {
      connected: connected,
      total: Object.keys(connectionStatus).length,
      relays: Object.assign({}, connectionStatus),
      pubkey: publicKey
    };
  }

  async function init() {
    if (!loadKeys()) {
      var keys = await generateKeypair();
      saveKeys(keys.sk, keys.pk);
    }

    RELAYS.forEach(function(url) {
      connectRelay(url);
    });

    subscribe({
      kinds: [1, 30023],
      '#t': ['gn-v2'],
      limit: 50
    });

    return { pubkey: publicKey };
  }

  window.GN_NOSTR = {
    init: init,
    publish: publish,
    subscribe: subscribe,
    onEvent: onEvent,
    getStatus: getStatus,
    getPublicKey: function() { return publicKey; }
  };
})();
