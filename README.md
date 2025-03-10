# MQTT Mosquitto Setup and Configuration

This guide covers the installation, configuration, and usage of the Mosquitto MQTT broker, along with a simple Node.js publisher and WebSocket-based subscriber.

## Prerequisites
- Windows OS
- Node.js installed ([Download](https://nodejs.org/))
- Mosquitto installed ([Download](https://mosquitto.org/download/))

---

## Step 1: Install Mosquitto

1. Download the Mosquitto installer from [Mosquitto's official site](https://mosquitto.org/download/).
2. Run the installer and ensure to check the option **"Install Service"**.
3. Open a command prompt and verify the installation:
   ```sh
   mosquitto -v
   ```
   If Mosquitto starts successfully, it is installed correctly.

---

## Step 2: Configure Mosquitto

Mosquitto's default setup only allows local connections. To enable remote access:

1. Open the Mosquitto configuration file, typically found at:
   ```
   C:\Program Files\Mosquitto\mosquitto.conf
   ```
2. Add or modify the following lines:
   ```conf
   listener 1883
   allow_anonymous true
   ````
3. Save the file and restart Mosquitto:
   ```sh
   net stop mosquitto
   net start mosquitto
   ```

---

## Step 3: Allow Mosquitto Through Windows Firewall

To allow external connections, open a command prompt as Administrator and run:

```sh
netsh advfirewall firewall add rule name="MQTT" dir=in action=allow protocol=TCP localport=1883
netsh advfirewall firewall add rule name="MQTT WebSocket" dir=in action=allow protocol=TCP localport=9001
```

---

## Step 4: Verify Mosquitto is Running

Check if Mosquitto is listening on port 1883:

```sh
netstat -ano | findstr :1883
```

If another process is using the port, find and kill it using:

```sh
taskkill /PID <PID> /F
```

---

## Step 5: Running the MQTT WebSocket-Based Subscriber

Create `subscriber.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MQTT Subscriber</title>
  <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
    textarea, input { width: 300px; margin: 10px; padding: 8px; }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>MQTT Subscriber</h1>
  <input type="text" id="topicInput" placeholder="Enter topic" />
  <br>
  <button onclick="subscribeTopic()">Subscribe</button>
  <button onclick="unsubscribeTopic()">Unsubscribe</button>
  <br>
  <textarea id="messageOutput" placeholder="Received messages will appear here..." readonly rows="10"></textarea>

  <script>
    const client = mqtt.connect('ws://localhost:9001');

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
    });

    client.on('message', (topic, message) => {
      document.getElementById('messageOutput').value += `Topic: ${topic} -> ${message.toString()}\n`;
    });

    function subscribeTopic() {
      const topic = document.getElementById('topicInput').value.trim();
      if (!topic) return alert('Enter a topic');
      client.subscribe(topic, err => {
        if (!err) alert(`Subscribed to ${topic}`);
      });
    }

    function unsubscribeTopic() {
      const topic = document.getElementById('topicInput').value.trim();
      if (!topic) return alert('Enter a topic');
      client.unsubscribe(topic, err => {
        if (!err) alert(`Unsubscribed from ${topic}`);
      });
    }
  </script>
</body>
</html>
```

---

## Step 6: Running the MQTT Publisher

Create `producer.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MQTT Producer</title>
  <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
    textarea, input { width: 300px; margin: 10px; padding: 8px; }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>MQTT Producer</h1>
  <input type="text" id="topicInput" placeholder="Enter topic" />
  <br>
  <textarea id="messageInput" placeholder="Type your message here..."></textarea>
  <br>
  <button onclick="publishMessage()">Publish</button>

  <script>
    function publishMessage() {
      const topic = document.getElementById('topicInput').value.trim();
      const message = document.getElementById('messageInput').value.trim();
      
      if (!topic || !message) return alert('Enter both topic and message');

      fetch('http://localhost:3000/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, message })
      })
      .then(response => response.json())
      .then(data => console.log('Published:', data));
    }
  </script>
</body>
</html>
```

---

## Step 7: Running the MQTT Publisher Backend

Create `server.js`:

```js
const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
const port = 3000;
const mqttClient = mqtt.connect('mqtt://localhost');

app.use(cors());
app.use(express.json());

mqttClient.on('connect', () => console.log('Connected to MQTT Broker'));

app.post('/publish', (req, res) => {
  const { topic, message } = req.body;
  if (!topic || !message) return res.status(400).json({ error: 'Topic and message are required' });
  mqttClient.publish(topic, message, err => {
    if (err) return res.status(500).json({ error: 'Publish error' });
    res.json({ success: 'Message published', topic });
  });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
```

---

## Conclusion
Now you can:
1. Start the backend: `node server.js`
2. Open `subscriber.html` and `producer.html` in a browser.
3. Send messages from `producer.html` and receive them in `subscriber.html`.

Enjoy MQTT with Mosquitto! 🚀
