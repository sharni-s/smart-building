$("#upgrade-user-btn").click(function () {
  let userIds = [];
  $(".cb:checkbox:checked").each(function () {
    userIds.push($(this).attr("id"));
  });
  const body = {
    userIds,
  };
  $.post(`/upgrade-users`, body).then((response) => {
    console.log(response);
    if (response.data == "UPGRADE ERROR") {
      $(".upg-err").html(
        `<p class="my-2 text-center fs-5">An error occured while upgrading users</p>`
      );
    } else {
      window.location.assign(`/users`);
    }
  });
});
