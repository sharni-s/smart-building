const API_URL = "http://localhost:5000/api";

const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

var TEST_LOC_ID = process.env.TEST_LOC_ID;
var TEST_USER_ID = process.env.TEST_USER_ID;

test("Test API Root", () => {
  let testURL = `${API_URL}`;
  axios.get(testURL).then((resp) => {
    expect(resp.data).toBe("Welcome to Smart Building API!");
  });
});

test("Test ADD Actuator", () => {
  let testURL = `${API_URL}/actuators/light`;
  let reqBody = {
    deviceType: "light",
    deviceId: "Test L2",
    deviceName: "Test Light 2",
    deviceMan: "Philips",
    product: "Philips Hue",
  };
  axios.post(testURL, reqBody).then((resp) => {
    // expect(resp.data).toBe("Device ID must be unique.");
    expect(resp.data).toBe("New Device Added");
  });
});

test("Test DELETE Actuator", () => {
  let testURL = `${API_URL}/delete/actuators/light`;
  let reqBody = {
    deviceIds: ["Test L2"],
  };
  axios.post(testURL, reqBody).then((resp) => {
    expect(resp.data).toBe("DELETION DONE");
  });
});

test("Test GET Actuators", () => {
  let testURL = `${API_URL}/actuators/light`;
  let expectResp = [
    {
      state: [],
      _id: "Test L1",
      name: "Test Light",
      manufacturer: "Philips",
      product_name: "Philips Hue",
      location: {
        id: "614b90faf6611355141fd2b3",
        name: "Test Room Floor 3",
      },
      type: "light",
      __v: 0,
    },
  ];
  axios.get(testURL).then((resp) => {
    expect(resp.data).toEqual(expectResp);
  });
});

test("Test ADD Sensor", () => {
  let testURL = `${API_URL}/sensors/tempSensor`;
  let reqBody = {
    deviceType: "tempSensor",
    deviceId: "Test T2",
    deviceName: "Test Temp 2",
    deviceMan: "Adafruit",
    product: "LM35",
  };
  axios.post(testURL, reqBody).then((resp) => {
    // expect(resp.data).toBe("Device ID must be unique.");
    expect(resp.data).toBe("New Device Added");
  });
});

test("Test DELETE Sensor", () => {
  let testURL = `${API_URL}/delete/sensors/tempSensor`;
  let reqBody = {
    deviceIds: ["Test T2"],
  };
  axios.post(testURL, reqBody).then((resp) => {
    expect(resp.data).toBe("DELETION DONE");
  });
});

test("Test GET Sensors", () => {
  let testURL = `${API_URL}/sensors/tempSensor`;
  let expectResp = [
    {
      sensorData: [],
      _id: "Test T1",
      name: "Test Temp",
      manufacturer: "Adafruit",
      product_name: "LM35",
      location: {
        id: "614b90faf6611355141fd2b3",
        name: "Test Room Floor 3",
      },
      type: "tempSensor",
      __v: 0,
    },
  ];
  axios.get(testURL).then((resp) => {
    expect(resp.data).toEqual(expectResp);
  });
});

test("Test ADD Location", () => {
  let testURL = `${API_URL}/add-location`;
  let reqBody = {
    roomName: "Test Room",
    floorNo: "3",
    lights: "Test L1",
    aircons: "Test A1",
    tempSensors: "Test T1",
    ambientSensors: "Test AS1",
    motionSensors: "Test M1",
  };
  axios.post(testURL, reqBody).then((resp) => {
    // expect(resp.data).toBe("Room already exists");
    expect(resp.data).toBe("New Location Added");
  });
});

test("Test EDIT Location", () => {
  let testURL = `${API_URL}/edit-location/${TEST_LOC_ID}`;
  let reqBody = {
    lights: "Test L1",
    aircons: "Test A1",
    tempSensors: "Test T1",
    ambientSensors: "Test AS1",
    motionSensors: "Test M1",
  };
  axios.post(testURL, reqBody).then((resp) => {
    expect(resp.data).toBe("DONE");
  });
});

test("Test GET Locations", () => {
  let testURL = `${API_URL}/locations/${TEST_LOC_ID}`;
  let expectResp = {
    light_state: {
      on: false,
      colour: "#FFFFFF",
      brightness: 100,
      mode: "Manual",
    },
    aircon_state: {
      on: false,
      aircon_temp: 24,
      mode: "Manual",
    },
    lights: [
      {
        id: "Test L1",
        name: "Test Light",
      },
    ],
    aircons: [
      {
        id: "Test A1",
        name: "Test Aircon",
      },
    ],
    _id: TEST_LOC_ID,
    name: "Test Room",
    floorNo: 3,
    tempSensor: {
      id: "Test T1",
      name: "Test Temp",
      sensorData: [],
    },
    motionSensor: {
      id: "Test M1",
      name: "Test Motion",
      sensorData: [],
    },
    ambientSensor: {
      id: "Test AS1",
      name: "Test Ambient Light",
      sensorData: [],
    },
    __v: 0,
  };
  axios.get(testURL).then((resp) => {
    expect(resp.data).toEqual(expectResp);
  });
});

test("Test GET Preference Insights", () => {
  let testURL = `${API_URL}/locations/preferences/${TEST_LOC_ID}`;
  let expectResp = {
    unset: 4,
    active: 0,
    inactive: 0,
  };
  axios.get(testURL).then((resp) => {
    expect(resp.data).toEqual(expectResp);
  });
});

test("Test GET User Preference", () => {
  let testURL = `${API_URL}/preferences/${TEST_USER_ID}/${TEST_LOC_ID}`;
  axios.get(testURL).then((resp) => {
    expect(resp.data).toEqual({});
  });
});

test("Test SET User Preference", () => {
  let testURL = `${API_URL}/preferences/${TEST_USER_ID}/${TEST_LOC_ID}`;
  let reqBody = {
    isActive: true,
    brightness: "39",
    colour: "#c2d9ff",
    temperature: "22",
  };
  axios.post(testURL, reqBody).then((resp) => {
    expect(resp.data).toEqual("DONE");
  });
});

test("Test GET Free Devices", () => {
  let testURL = `${API_URL}/freeDevices`;
  let expectResp = {
    freeLights: [
      {
        _id: "L8",
        name: "Light 8",
        type: "light",
      },
    ],
    freeAircons: [
      {
        _id: "A5",
        name: "Air Conditioner 5",
        type: "aircon",
      },
      {
        _id: "A6",
        name: "Air Conditioner 6",
        type: "aircon",
      },
    ],
    freeTempSensors: [],
    freeMotionSensors: [],
    freeAmbientSensors: [],
  };
  axios.get(testURL).then((resp) => {
    expect(resp.data).toEqual(expectResp);
  });
});

test("Test DELETE Location", () => {
  let testURL = `${API_URL}/locations/${TEST_LOC_ID}`;
  axios.delete(testURL).then((resp) => {
    expect(resp.data).toBe("DONE");
  });
});
