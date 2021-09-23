String ID = "M1";
const int pirPin = 2; 
int val = 0;

void setup()
{
  pinMode(pirPin, INPUT);
  Serial.begin(9600);
}

void loop()
{
  pirState = digitalRead(pirPin);
  if(pirState) {
      String message = "\n[" + ID + "," + "1" + "," + "motionSensor" + "]";
      Serial.print(message);
  }
  delay(1000);
}