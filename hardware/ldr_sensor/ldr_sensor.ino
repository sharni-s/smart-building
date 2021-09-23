String ID = "AS1";
const int LDR = A0;
int val = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  val = analogRead(LDR);
  int brightness = ((val/1023) * 100);  
  // Print a message to the serial port with the sensor's id and temperature
  String message = "\n[" + ID + "," + String(val) + "," + "ambientSensor" + "]";
  Serial.print(message);
  
  delay(10000);
}