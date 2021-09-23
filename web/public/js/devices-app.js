const API_URL = "http://localhost:5000/api";

const actuators = ["light", "aircon"];
const sensors = ["tempSensor", "ambientSensor", "motionSensor"];

$("#add-devices-btn").on("click", () => {
  location.href = "/add-devices";
});

$("#delete-devices-btn").on("click", () => {
  location.href = "/delete-devices/light";
});

$("#selectDevice").change(function () {
  $(".devices-content").show();
  let deviceType = $(this).val();
  let requestURL = "";
  if (sensors.includes(deviceType)) {
    requestURL = `${API_URL}/sensors/${deviceType}`;
  } else if (actuators.includes(deviceType)) {
    requestURL = `${API_URL}/actuators/${deviceType}`;
  }
  $(".devices-content").html(`
  <table class="table table-hover">
    <thead>
        <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Manufacturer</th>
            <th scope="col">Product Name</th>
            <th scope="col">Location</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>
  `);
  $.get(requestURL, (data, status) => {
    if (status == "success") {
      if (data.length) {
        data.forEach((device) => {
          let locName = "";
          if (device.location) {
            locName = device.location.name;
          }
          $(".devices-content table tbody").append(`
            <tr>
                  <th scope="row">${device._id}</th>
                  <td>${device.name}</td>
                  <td>${device.manufacturer}</td>
                  <td>${device.product_name}</td>
                  <td>${locName}</td>
              </tr>
          `);
        });
      } else {
        $(".devices-content").html(
          `<p class="mb-2 text-center fs-5">No devices found</p>`
        );
      }
    } else {
      $(".devices-content").html(`An error occured while loading data.`);
    }
  });
});
