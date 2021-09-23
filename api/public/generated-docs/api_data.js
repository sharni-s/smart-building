define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./public/generated-docs/main.js",
    "group": "C:\\Users\\4shar\\code\\SIT209\\Individual Project\\api\\public\\generated-docs\\main.js",
    "groupTitle": "C:\\Users\\4shar\\code\\SIT209\\Individual Project\\api\\public\\generated-docs\\main.js",
    "name": ""
  },
  {
    "type": "get",
    "url": "/api/actuators/:deviceType",
    "title": "Get Actuators",
    "group": "Devices",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"light\"",
              "\"aircon\""
            ],
            "optional": false,
            "field": "deviceType",
            "description": "<p>Type of actuator</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/actuators/light",
        "type": "url"
      }
    ],
    "description": "<p>Get the details of all the actuators of a given type (light or aircon) in the smart building.</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "[\n  {\n     state: [],\n     _id: \"Test L1\",\n     name: \"Test Light\",\n     manufacturer: \"Philips\",\n     product_name: \"Philips Hue\",\n     location: {\n       id: \"614b90faf6611355141fd2b3\",\n       name: \"Test Room Floor 3\",\n     },\n     type: \"light\",\n     __v: 0,\n  },\n  ...\n  ...\n  ...\n]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Devices",
    "name": "GetApiActuatorsDevicetype"
  },
  {
    "type": "get",
    "url": "/api/freeDevices",
    "title": "Get Free Devices",
    "group": "Devices",
    "description": "<p>Get the id, name and type of all the free devices (not assigned to any room) in the smart building.</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "{\n  freeLights: [\n    {\n      _id: \"Test L1\",\n      name: \"Test Light\",\n      type: \"light\",\n    },\n  ],\n  freeAircons: [\n    {\n      _id: \"Test A1\",\n      name: \"Test Aircon\",\n      type: \"aircon\",\n    },\n  ],\n  freeTempSensors: [],\n  freeMotionSensors: [],\n  freeAmbientSensors: [],\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Devices",
    "name": "GetApiFreedevices"
  },
  {
    "type": "get",
    "url": "/api/sensors/:sensorType",
    "title": "Get Sensors",
    "group": "Devices",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"tempSensor\"",
              "\"ambientSensor\"",
              "\"motionSensor\""
            ],
            "optional": false,
            "field": "sensorType",
            "description": "<p>Type of actuator</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/sensors/tempSensor",
        "type": "url"
      }
    ],
    "description": "<p>Get the details of all the sensors of a given type (temperature sensor, ambient light sensor, motion sensor) in the smart building.</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "[\n  {\n     sensorData: [],\n     _id: \"Test T1\",\n     name: \"Test Temp\",\n     manufacturer: \"Adafruit\",\n     product_name: \"LM35\",\n     location: {\n       id: \"614b90faf6611355141fd2b3\",\n       name: \"Test Room Floor 3\",\n     },\n     type: \"tempSensor\",\n     __v: 0,\n  },\n  ...\n  ...\n  ...\n]",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Devices",
    "name": "GetApiSensorsSensortype"
  },
  {
    "type": "post",
    "url": "/api/actuators/:deviceType",
    "title": "Add New Actuator",
    "group": "Devices",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"light\"",
              "\"aircon\""
            ],
            "optional": false,
            "field": "deviceType",
            "description": "<p>Type of actuator</p>"
          }
        ]
      }
    },
    "description": "<p>If device id already exists, &quot;Device ID must be unique.&quot; is sent as response.</p>",
    "examples": [
      {
        "title": "Request Body:",
        "content": "body =\n{\n   deviceType: \"light\",\n   deviceId: \"Test L2\",\n   deviceName: \"Test Light 2\",\n   deviceMan: \"Philips\",\n   product: \"Philips Hue\",\n}",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"New Device Added\"",
          "type": "String"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Devices",
    "name": "PostApiActuatorsDevicetype"
  },
  {
    "type": "post",
    "url": "/api/delete/actuators/:deviceType",
    "title": "Delete Actuators",
    "group": "Devices",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"light\"",
              "\"aircon\""
            ],
            "optional": false,
            "field": "deviceType",
            "description": "<p>Type of actuators</p>"
          }
        ]
      }
    },
    "description": "<p>Delete all actuators whose IDs are sent in the request body</p>",
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/delete/actuators/light\nbody =\n{\n   deviceIds: [\"Test L2\"],\n}",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"DELETION DONE\"",
          "type": "String"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Devices",
    "name": "PostApiDeleteActuatorsDevicetype"
  },
  {
    "type": "post",
    "url": "/api/delete/sensors/:sensorType",
    "title": "Delete Sensors",
    "group": "Devices",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"tempSensor\"",
              "\"ambientSensor\"",
              "\"motionSensor\""
            ],
            "optional": false,
            "field": "sensorType",
            "description": "<p>Type of sensor</p>"
          }
        ]
      }
    },
    "description": "<p>Delete all sensors whose IDs are sent in the request body</p>",
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/delete/sensors/tempSensor\nbody =\n{\n   deviceIds: [\"Test T2\"],\n}",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"DELETION DONE\"",
          "type": "String"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Devices",
    "name": "PostApiDeleteSensorsSensortype"
  },
  {
    "type": "post",
    "url": "/api/sensors/:sensorType",
    "title": "Add New Sensor",
    "group": "Devices",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"tempSensor\"",
              "\"ambientSensor\"",
              "\"motionSensor\""
            ],
            "optional": false,
            "field": "sensorType",
            "description": "<p>Type of sensor</p>"
          }
        ]
      }
    },
    "description": "<p>If device id already exists, &quot;Device ID must be unique.&quot; is sent as response.</p>",
    "examples": [
      {
        "title": "Request Body:",
        "content": "body =\n{\n   deviceType: \"tempSensor\",\n   deviceId: \"Test T2\",\n   deviceName: \"Test Temp 2\",\n   deviceMan: \"Adafruit\",\n   product: \"LM35\",\n}",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"New Device Added\"",
          "type": "String"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Devices",
    "name": "PostApiSensorsSensortype"
  },
  {
    "type": "delete",
    "url": "/api/locations/:locationId",
    "title": "Delete Location",
    "group": "Location",
    "description": "<p>Delete a location from the smart building.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "locationId",
            "description": "<p>ID of the Location</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/locations/614b64747a4a906b9c7db78f",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"DONE\"",
          "type": "String"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Location",
    "name": "DeleteApiLocationsLocationid"
  },
  {
    "type": "get",
    "url": "/api/locations/:locationId?",
    "title": "Get Details of Location(s)",
    "group": "Location",
    "description": "<p>Get details like state of devices in a location in the smart building.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "locationId",
            "description": "<p>ID of the Location</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/locations/614b64747a4a906b9c7db78f",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response with parameter",
          "content": "{\n  light_state: {\n    on: false,\n    colour: \"#FFFFFF\",\n    brightness: 100,\n    mode: \"Manual\",\n  },\n  aircon_state: {\n    on: false,\n    aircon_temp: 24,\n    mode: \"Manual\",\n  },\n  lights: [\n    {\n      id: \"Test L1\",\n      name: \"Test Light\",\n    },\n  ],\n  aircons: [\n    {\n      id: \"Test A1\",\n      name: \"Test Aircon\",\n    },\n  ],\n  _id: \"614b64747a4a906b9c7db78f\",\n  name: \"Test Room\",\n  floorNo: 3,\n  tempSensor: {\n    id: \"Test T1\",\n    name: \"Test Temp\",\n    sensorData: [],\n  },\n  motionSensor: {\n    id: \"Test M1\",\n    name: \"Test Motion\",\n    sensorData: [],\n  },\n  ambientSensor: {\n    id: \"Test AS1\",\n    name: \"Test Ambient Light\",\n    sensorData: [],\n  },\n  __v: 0,\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Location",
    "name": "GetApiLocationsLocationid"
  },
  {
    "type": "post",
    "url": "/api/add-location",
    "title": "Add New Location",
    "group": "Location",
    "description": "<p>If location already exists, &quot;Room already exists&quot; is sent as response.</p>",
    "examples": [
      {
        "title": "Request Body:",
        "content": "body =\n{\n   roomName: \"Test Room\",\n   floorNo: \"3\",\n   lights: \"Test L1\",\n   aircons: \"Test A1\",\n   tempSensors: \"Test T1\",\n   ambientSensors: \"Test AS1\",\n   motionSensors: \"Test M1\",\n}",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"New Location Added\"",
          "type": "String"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Location",
    "name": "PostApiAddLocation"
  },
  {
    "type": "post",
    "url": "/api/edit-location/:locationId",
    "title": "Update Devices in Location",
    "group": "Location",
    "description": "<p>Add or delete devices in a location in the smart building.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "locationId",
            "description": "<p>ID of the Location</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/edit-location/614b64747a4a906b9c7db78f\nbody =\n{\n   lights: \"Test L1\",\n   aircons: \"Test A1\",\n   tempSensors: \"Test T1\",\n   ambientSensors: \"Test AS1\",\n   motionSensors: \"Test M1\",\n}",
        "type": "url"
      }
    ],
    "body": [
      {
        "group": "Body",
        "type": "String",
        "optional": true,
        "field": "lights",
        "description": "<p>Lights in the room</p>"
      },
      {
        "group": "Body",
        "type": "String",
        "optional": true,
        "field": "aircons",
        "description": "<p>Air conditioners in the room</p>"
      },
      {
        "group": "Body",
        "type": "String",
        "optional": true,
        "field": "tempSensors",
        "description": "<p>Temperature Sensors in the room</p>"
      },
      {
        "group": "Body",
        "type": "String",
        "optional": true,
        "field": "ambientSensors",
        "description": "<p>Ambient Sensors in the room</p>"
      },
      {
        "group": "Body",
        "type": "String",
        "optional": true,
        "field": "motionSensors",
        "description": "<p>Motion Sensors in the room</p>"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"DONE\"",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Location",
    "name": "PostApiEditLocationLocationid"
  },
  {
    "type": "get",
    "url": "/api/locations/preferences/:locationId",
    "title": "Preference Insights",
    "group": "Preferences",
    "description": "<p>Get the number of users with active, inactive and unset preferences in a location.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "locationId",
            "description": "<p>ID of the Location</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/locations/preferences/614b64747a4a906b9c7db78f",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "{\n   \"unset\": 3,\n   \"active\": 1,\n   \"inactive\": 2\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Preferences",
    "name": "GetApiLocationsPreferencesLocationid"
  },
  {
    "type": "get",
    "url": "/api/preferences/:userId/:locationId",
    "title": "Get User Preferences",
    "group": "Preferences",
    "description": "<p>Get the user's preferences for the given location in the smart building</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>ID of the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "locationId",
            "description": "<p>ID of the Location</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/preferences/614bb22aca22eb5280f1bacf/614b90faf6611355141fd2b3",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "{\n  \"light\": {\n     \"colour\": \"#c2d9ff\",\n     \"brightness\": \"39\"\n  },\n  \"aircon\": {\n     \"temperature\": 22\n  },\n  \"_id\": \"614bb3ab15781516d835c335\",\n  \"locationId\": \"614b90faf6611355141fd2b3\",\n  \"isActive\": true\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Preferences",
    "name": "GetApiPreferencesUseridLocationid"
  },
  {
    "type": "post",
    "url": "/api/preferences/:userId/:locationId",
    "title": "Set User Preferences",
    "group": "Preferences",
    "description": "<p>Set the user's preferences for the given location in the smart building</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>ID of the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "locationId",
            "description": "<p>ID of the Location</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage",
        "content": "/api/preferences/614bb22aca22eb5280f1bacf/614b90faf6611355141fd2b3\nbody = \n{\n   isActive: true,  \n   brightness: '39',\n   colour: '#c2d9ff',\n   temperature: '22'\n}",
        "type": "url"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"DONE\"",
          "type": "String"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response",
          "content": "Error Object",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Preferences",
    "name": "PostApiPreferencesUseridLocationid"
  },
  {
    "type": "get",
    "url": "/api",
    "title": "Test API",
    "group": "Test",
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\"Welcome to Smart Building API!\"",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api.js",
    "groupTitle": "Test",
    "name": "GetApi"
  }
] });
