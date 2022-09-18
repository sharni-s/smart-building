# Infinity and Beyond
Infinity and Beyond is a web based IoT management application for a smart building. The website has services to manage smart lighting and smart air conditioning for the building. 

The four main components of the smart building web application are the Main server, the API, the MQTT API and the MongoDB database. The Main Server receives HTTP requests and sends back the files and data required to render the web page on the user’s browser. It also handles user authentication by registering and logging in users. The API handles all CRUD operations for devices and rooms in the smart building. In addition, the API server is also used for setting user preferences and retrieving user preference insights for a room. The MQTT API receives sensor data from the various sensors in the smart building and sets the state of lights and air conditioners. The MQTT API also handles all the automated sense reason act loops for different devices in the smart building. And the MongoDB database stores all the information related to the devices and users in the system.

![image](https://user-images.githubusercontent.com/87380954/190855491-a1b10200-6326-40e8-963e-020f4fa0d115.png)
