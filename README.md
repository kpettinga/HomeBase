# HomeBase

> **HomeBase** is a web app that remotely controls, via websockets, single-board computers (e.g. Raspberry Pi, Arduino Nano, etc) which are placed in close proximity to mini-split AC units. It is still in early alpha with lots of features currently in development.

**Preview:**

|![Dashboard](/public/dashboard.png)|![Room](/public/room.png)|
|-|-|

This project is my solution to modern home climate control when no central heating or air conditioning systems are available. 

I live in a tropical climate and my home only has mini-split AC units (condenser outside, fan inside) in each room. By default, they are not connected and I must be physically present to control them. This causes problems for situations like going out of town. Extremely high day-time temperatures cause the house to become very warm an, since it is very humid, especially in the rainy season, its common to get mold growing in the house and in the AC units themselves.

---

**Current planned feature list:**

- [x] Read current temperature and humidity
- Air conditioning unit control
  - [ ] Set temperature
  - [ ] Set fan speed
  - [ ] Toggle On/Off
- [ ] Use websockets (instead of pinging an endpoint) for realtime monitoring of climate and AC unit status.
- Bootstrap process for setting up new SBC device
  - [ ] Linux tools (lirc, tmux, ngrok, node, python3, etc)
  - [ ] Python script for reading sensor data
  - [ ] Node script for server
  - likely more...

**Further down the road:**

- Security camera integration
- ???
