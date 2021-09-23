String ID = "T1";
const int LM35 = A0;
float celsius = 0;

void setup() 
{
  Serial.begin(9600);
}

void loop() 
{
  // Read temperature sensor and calculate temperature in celsius
  float val = analogRead(LM35);
  float mv = (val/1024.0)*5000; 
  float cel = mv/10;

  // Print a message to the serial port with the sensor's id and temperature
  String message = "\n[" + ID + "," + String(cel) + "," + "tempSensor" + "]";
  Serial.print(message);
  
  delay(10000);
}
