import Swal from "sweetalert2";

const CommonDeleteModal = async ({
  title = "Are you sure?",
  text = "You won't be able to revert this!",
  confirmButtonText = "Yes, delete it!",
  cancelButtonText = "Cancel",
  data,
  fetchData, // Callback when delete is successful
  deleteFuntion,
  Url,
  setParentChecked,
  setChildCheckedState,
  params = "",
}) => {
  try {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
    });

    if (result.isConfirmed) {
      // Call the delete function passed as a prop
      deleteFuntion(Url, data)
        .then((res) => {
          if (res?.data == true || res?.data?.data) {
            if (params != "") {
              fetchData(params);
            } else {
              fetchData();
            }
            setParentChecked(false);
            setChildCheckedState([]);
            Swal.fire("Deleted!", "Your item has been deleted.", "success");
          }
        })
        .catch((err) => {
          console.log(err);
          Swal.fire("Error", "There was an issue while deleting.", "error");
          return false;
        });
    } else {
      Swal.fire("Cancelled", "Your data is safe", "info");
      return false;
    }
  } catch (error) {
    console.error("Error during the delete confirmation:", error);
    return false;
  }
};

export default CommonDeleteModal;
