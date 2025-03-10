const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
const port = 3000;

// MQTT Broker WebSocket Connection
const mqttBroker = 'mqtt://localhost'; // MQTT broker for backend publishing
const mqttWsBroker = 'ws://localhost:9001'; // WebSocket broker for frontend clients
const mqttClient = mqtt.connect(mqttBroker);

app.use(cors());
app.use(express.json());

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
});

mqttClient.on('message', (topic, message) => {
  console.log(`Received on "${topic}": ${message.toString()}`);
});

// Publish message to any topic
app.post('/publish', (req, res) => {
  const { topic, message } = req.body;

  if (!topic || !message) {
    return res.status(400).json({ error: 'Topic and message are required' });
  }

  console.log(`Publishing to "${topic}": ${message}`);
  mqttClient.publish(topic, message, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error publishing message' });
    }
    res.json({ success: 'Message published', topic });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
