# Mosquitto MQTT Broker Setup on Windows

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Firewall & Network Setup](#firewall--network-setup)
- [Starting and Stopping Mosquitto](#starting-and-stopping-mosquitto)
- [Useful Commands](#useful-commands)
- [Testing Mosquitto](#testing-mosquitto)
- [Troubleshooting](#troubleshooting)

---

## Installation
1. Download Mosquitto from the official website:  
   [https://mosquitto.org/download/](https://mosquitto.org/download/)

2. Run the installer (`mosquitto-*.exe`). During installation, ensure the option to install the service is checked.

3. Verify installation:
   ```sh
   mosquitto -v
   ```
   If you see a version number and startup logs, the installation was successful.

---

## Configuration
The Mosquitto configuration file (`mosquitto.conf`) is located in the installation directory (e.g., `C:\Program Files\Mosquitto`).

### Enable Remote Access
By default, Mosquitto only allows local connections. To allow external clients:

1. Open `mosquitto.conf` in a text editor.
2. Add the following lines:
   ```ini
   listener 1883
   allow_anonymous true  # Allow connections without authentication
   ```
3. Save the file and restart Mosquitto.

For authentication with username/password, add:
```ini
password_file password.txt
allow_anonymous false
```
Then create a password file:
```sh
mosquitto_passwd -c password.txt your_username
```

---

## Firewall & Network Setup
To allow external connections, configure Windows Firewall:
```sh
netsh advfirewall firewall add rule name="Mosquitto MQTT" dir=in action=allow protocol=TCP localport=1883
```

To verify:
```sh
netsh advfirewall firewall show rule name="Mosquitto MQTT"
```

If using a cloud or VPS, open port **1883** in your provider's firewall settings.

---

## Starting and Stopping Mosquitto
### Start Mosquitto as a Service
```sh
net start mosquitto
```

### Stop Mosquitto Service
```sh
net stop mosquitto
```

### Start Mosquitto Manually
```sh
mosquitto -c "C:\Program Files\Mosquitto\mosquitto.conf" -v
```

---

## Useful Commands
### Check if Mosquitto is Running
```sh
netstat -ano | findstr :1883
```

### Kill Mosquitto Process (if needed)
Find the process ID (PID):
```sh
netstat -ano | findstr :1883
```
Kill the process (replace `PID` with actual number):
```sh
taskkill /PID <PID> /F
```

### Enable Mosquitto Auto-Start
```sh
sc config mosquitto start= auto
```

---

## Testing Mosquitto
### Start a Subscriber
```sh
mosquitto_sub -h localhost -t test/topic
```

### Publish a Message
```sh
mosquitto_pub -h localhost -t test/topic -m "Hello, MQTT!"
```

For remote testing, replace `localhost` with the Mosquitto server IP.

---

## Troubleshooting
### Error: "An attempt was made to access a socket in a way forbidden by its access permissions"
**Solution:**
- Stop any processes using port 1883:
  ```sh
  netstat -ano | findstr :1883
  taskkill /PID <PID> /F
  ```
- Run Mosquitto as an administrator.
- Check firewall settings.

### Error: "Connection Refused"
**Solution:**
- Ensure Mosquitto is running.
- Open port 1883 in the firewall.
- If using authentication, verify credentials.

---

### Additional Resources
- Mosquitto Documentation: [https://mosquitto.org/documentation/](https://mosquitto.org/documentation/)

