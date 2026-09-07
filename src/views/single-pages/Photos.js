import React, { useState } from "react";
import Box from "@mui/material/Box";
import MainCard from "ui-component/cards/MainCard";
import { gridSpacing } from "store/constant";
import {
  Button,
  CardContent,
  Checkbox,
  Grid,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { Modal, Backdrop, Fade } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useParams } from "react-router-dom";
import { useFetchData } from "helper/useFetchData";
import { GET_GALLERY_LOGS } from "config/ApiNameConstant";
import CommonImageModal from "views/CommonImageModal";
import CommonDeleteModal from "views/CommonDeleteModal";
import useCommonCheckbox from "views/useCommonCheckbox";
import ApiUtils from "api/ApiUtils";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundcolor: "red",
    },
  },
  img: {
    outline: "none",
  },
}));
function Photos() {
  const urlParam = useParams();
  const classes = useStyles();
  const userDeviceIdAsNumber = urlParam.userDeviceId;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [page, setPage] = useState(0);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [image, setImage] = useState("");
  const params = `DeviceUserId=${userDeviceIdAsNumber}&Page=${currentPageNumber}&PageSize=${12}&FileType=${1}`;
  const { totalCount, data, fetchData } = useFetchData(
    GET_GALLERY_LOGS,
    params,
    currentPageNumber
  );
  const [openExcelModal, setOpenExcelModal] = useState(false);

  const {
    childCheckedState,
    parentChecked,
    handleParentCheckboxChange,
    handleChildCheckboxChange,
    setParentChecked,
    setChildCheckedState,
  } = useCommonCheckbox(data, "galleryId");
  const handleDelete = async (data, setParentChecked, setChildCheckedState) => {
    // Call the CommonDeleteModal
    await CommonDeleteModal({
      data,
      fetchData, // Refresh data after deletion
      onError: (error) => {
        console.error("Delete error:", error); // Handle errors
      },
      deleteFuntion: ApiUtils.DeleteRange,
      Url: "Gallery/DeleteRange",
      setParentChecked,
      setChildCheckedState,
    });
  };
  const handleChangePage = (e, page) => {
    setCurrentPageNumber(page + 1);
    setPage(page);
  };
  const handleClose = () => {
    setOpenImageModal(false);
  };

  const handleImage = (value) => {
    setImage(value);
    setOpenImageModal(true);
  };
  return (
    <>
      <MainCard content={false} title="Gallery Photos">
        <Grid
          container
          spacing={2}
          display="flex"
          justifyContent="space-between"
          mt={1}
        >
          <Grid item ml={2}>
            {data?.length > 0 && (
              <>
                <Checkbox
                  className="parentCheckbox"
                  type="checkbox"
                  checked={parentChecked}
                  onChange={handleParentCheckboxChange}
                />
                Check for selecting all images
              </>
            )}
          </Grid>
          <Grid item mr={2} ml={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setOpenExcelModal(true)}
            >
              Upload Data
            </Button>
            {childCheckedState?.length > 0 && (
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: "red",
                  borderRadius: "10px",
                  marginLeft: "10px",
                }}
                onClick={() =>
                  handleDelete(
                    childCheckedState,
                    setParentChecked,

                    setChildCheckedState
                  )
                }
              >
                Delete Data
              </Button>
            )}
          </Grid>
        </Grid>
        <CardContent>
          <Grid container spacing={gridSpacing}>
            {data.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Grid container justifyContent="start" gap="14px">
                    {data?.map((item) => (
                      <>
                        <Grid>
                          <Box className="video-container">
                            <div>
                              <Checkbox
                                type="checkbox"
                                checked={childCheckedState?.includes(
                                  item?.galleryId
                                )}
                                onChange={(e) =>
                                  handleChildCheckboxChange(e, item?.galleryId)
                                }
                                sx={{ float: "right" }}
                              />
                            </div>
                            <Stack
                              className="video-container-stack"
                              onClick={() => handleImage(item)}
                            >
                              <img
                                loading="lazy"
                                src={item.fileUrl}
                                width="100%"
                                height="300px"
                                alt={item.name}
                              />
                            </Stack>
                          </Box>
                        </Grid>
                      </>
                    ))}
                  </Grid>
                </Grid>
                <TablePagination
                  component="div"
                  count={totalCount}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={12}
                  labelRowsPerPage=""
                  sx={{
                    "& .MuiSelect-select": {
                      display: "none !important",
                    },
                    "& > div.MuiToolbar-root > div.MuiInputBase-root > svg": {
                      display: "none !important",
                    },
                  }}
                />
              </>
            ) : (
              <Grid item>
                <Typography
                  variant="h4"
                  color="inherit"
                  sx={{ fontWeight: "500" }}
                >
                  No data to display
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </MainCard>
      <Modal
        className={classes.modal}
        open={openImageModal}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openImageModal} timeout={500} className={classes.img}>
          <img
            src={image.fileUrl}
            alt={image.name}
            style={{ maxHeight: "90%", maxWidth: "90%" }}
          />
        </Fade>
      </Modal>
      <CommonImageModal
        userDeviceId={userDeviceIdAsNumber}
        open={openExcelModal}
        setOpenExcelModal={setOpenExcelModal}
        title="Upload Photos"
        fetchData={fetchData}
        Url={`Gallery/AddGallery?deviceUserId=${userDeviceIdAsNumber}`}
        type="image"
      />
    </>
  );
}

export default Photos;
