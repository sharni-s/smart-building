$(document).ready(function () {
  $(".carousel").carousel({
    interval: false,
  });
});

$("#light-submit").click(function () {
  $("#light-form").submit();
});

$("#aircon-submit").click(function () {
  $("#aircon-form").submit();
});

$("#pref-submit").click(function () {
  $("#pref-form").submit();
});

var lightBrDiv = document.getElementById("light-brightness");
if (lightBrDiv) {
  document
    .getElementById("light-brightness")
    .addEventListener("input", function (e) {
      let op = this.value / 100;
      $(".lamp-icon").css("opacity", `${op}`);
    });
}

var lightColDiv = document.getElementById("light-colour");
if (lightColDiv) {
  document
    .getElementById("light-colour")
    .addEventListener("input", function (e) {
      let col = this.value;
      $(".light-visualise").css("color", `${col}`);
      $(".light-visualise").css("border-color", `${col}`);
    });
}

airconTemp = document.getElementById("aircon-temp");
if (airconTemp) {
  document
    .getElementById("aircon-temp")
    .addEventListener("input", function (e) {
      let colour = "#43b8ee";
      if (this.value > 24) {
        colour = "#ee2e55";
      }
      $(".aircon-visualise").css("color", colour);
      $(".aircon-visualise").css("border-color", colour);
    });
}

var prefGraphDiv = document.getElementById("prefDiv");
if (prefGraphDiv) {
  let vals = [prefData.unset, prefData.inactive, prefData.active];
  for (i = 0; i < vals.length; i++) {
    if (vals[i] == 0) vals[i] = null;
  }
  let data = [
    {
      values: vals,
      labels: [
        "Users with Unset Preferences",
        "Users with Inactive Preferences",
        "Users with Active Preferences",
      ],
      type: "pie",
      textinfo: "value",
      hoverinfo: "label",
      marker: {
        colors: ["#2B2E4A", "#903749", "#E84545"],
      },
      showlegend: true,
      hole: 0.5,
    },
  ];
  let layout = {
    title: "Preference Insights<br>",
    titlefont: {
      size: 26,
      color: "#2B2E4A",
    },
    margin: {
      r: 80,
    },
  };

  Plotly.newPlot("prefDiv", data, layout);
}

var tempGraphDiv = document.getElementById("tempDiv");
if (tempGraphDiv) {
  let tempX = [],
    tempY = [];
  temp.forEach((data) => {
    dateVal = new Date(data.timeStamp);
    tempX.push(dateVal);
    tempY.push(data.value);
  });

  let data = [
    {
      x: tempX,
      y: tempY,
      type: "scatter",
      line: {
        color: "#293A80",
        width: 3,
      },
    },
  ];
  let layout = {
    title: "Room Temperature",
    titlefont: {
      size: 26,
      color: "#293A80",
    },
    xaxis: {
      title: "Time",
      titlefont: {
        size: 18,
        color: "#7f7f7f",
      },
    },
    yaxis: {
      title: "Temperature (°C)",
      titlefont: {
        size: 18,
        color: "#7f7f7f",
      },
    },
  };

  Plotly.newPlot("tempDiv", data, layout);
}

var ambGraphDiv = document.getElementById("ambientDiv");
if (ambGraphDiv) {
  let ambX = [],
    ambY = [];
  amb.forEach((data) => {
    dateVal = new Date(data.timeStamp);
    ambX.push(dateVal);
    ambY.push(data.value);
  });

  let data = [
    {
      x: ambX,
      y: ambY,
      type: "scatter",
      line: {
        color: "#bd4f6c",
        width: 3,
      },
    },
  ];
  let layout = {
    title: "Room Brightness",
    titlefont: {
      size: 26,
      color: "#bd4f6c",
    },
    xaxis: {
      title: "Time",
      titlefont: {
        size: 18,
        color: "#7f7f7f",
      },
    },
    yaxis: {
      title: "Brightness (%)",
      titlefont: {
        size: 18,
        color: "#7f7f7f",
      },
    },
  };

  Plotly.newPlot("ambientDiv", data, layout);
}
