/**
 * SSE Manager
 * Keeps track of all connected client tabs and broadcasts
 * new settings the instant the admin saves — zero polling needed.
 */

const clients = new Set();

/** Register a new SSE response stream */
function addClient(res) {
  clients.add(res);
}

/** Remove a disconnected stream */
function removeClient(res) {
  clients.delete(res);
}

/** Push settings to every connected tab right now */
function broadcast(settings) {
  if (clients.size === 0) return;
  const payload = `data: ${JSON.stringify(settings)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(res); // remove dead connections
    }
  }
  console.log(`📡  SSE: broadcast settings to ${clients.size} connected tab(s)`);
}

function clientCount() {
  return clients.size;
}

module.exports = { addClient, removeClient, broadcast, clientCount };

