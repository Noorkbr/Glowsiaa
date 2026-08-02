/**
 * SSE Manager — Global real-time event bus.
 * Every connected client tab gets pushed events the instant any admin save occurs.
 *
 * Event types: settings | banners | products | categories | tips | coupons
 */

const clients = new Set();

function addClient(res)    { clients.add(res); }
function removeClient(res) { clients.delete(res); }
function clientCount()     { return clients.size; }

/**
 * Broadcast a typed SSE event to every connected tab.
 * @param {string} type - event name (settings | banners | products | categories | tips | coupons)
 * @param {object} data - payload sent as JSON
 */
function broadcastEvent(type, data = {}) {
  if (clients.size === 0) return;
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  let sent = 0;
  for (const res of clients) {
    try   { res.write(payload); sent++; }
    catch { clients.delete(res); }
  }
  if (sent > 0) console.log(`📡  SSE [${type}] → ${sent} tab(s)`);
}

/** Convenience alias — keeps settings.js backward compatible */
const broadcast = (data) => broadcastEvent('settings', data);

module.exports = { addClient, removeClient, broadcastEvent, broadcast, clientCount };
