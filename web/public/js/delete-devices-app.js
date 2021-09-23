$("#selectDevice").change(function () {
  let deviceType = $(this).val();
  location.href = `/delete-devices/${deviceType}`;
});

$(".dtype").text(
  $(`#selectDevice option[value='${$(".dtype").attr("id")}']`).text()
);

$("#delete-devices-btn").click(function () {
  let deviceIds = [];
  $(".cb:checkbox:checked").each(function () {
    deviceIds.push($(this).attr("id"));
  });
  const body = {
    deviceIds,
  };
  $.post(`/delete-devices/${$(".dtype").attr("id")}`, body).then((response) => {
    console.log(response);
    if (response.data == "DELETION ERROR") {
      $(".del-err").html(
        `<p class="my-2 text-center fs-5">An error occured while deleting devices</p>`
      );
    } else {
      window.location.assign(`/delete-devices/${$(".dtype").attr("id")}`);
    }
  });
});
