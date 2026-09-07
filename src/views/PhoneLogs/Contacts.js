import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
  Button,
  CardContent,
  Checkbox,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import { GridActionsCellItem } from "@mui/x-data-grid";
import MainCard from "ui-component/cards/MainCard";
import { gridSpacing } from "store/constant";
import { useParams } from "react-router-dom";
import ApiUtils from "api/ApiUtils";
import CustomDataGridTable from "helper/CustomDataGridTable";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  extractDate,
  extractTime,
  formatDate,
  formatTimestampToTime,
} from "helper/GetDateTimeFormat";
import Modal from "@mui/material/Modal";
import LocationMap from "helper/LocationMap";
import CloseIcon from "@mui/icons-material/Close";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import Chip from "@mui/material/Chip";
import CallMadeIcon from "@mui/icons-material/CallMade";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import BadgeIcon from "@mui/icons-material/Badge";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import EmailIcon from "@mui/icons-material/Email";
import { FaTrash } from "react-icons/fa6";
import useCommonCheckbox from "views/useCommonCheckbox";
import CommonDeleteModal from "views/CommonDeleteModal";
import CommonModal from "views/CommonModal";
const Contacts = () => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  const urlParam = useParams();
  const userDeviceIdAsNumber = Number(urlParam.userDeviceId);
  const [totalCount, setTotalCount] = useState(0);
  const [contactsData, setContactsData] = useState([]);
  const [callLogData, setCallLogData] = useState([]);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [open, setOpen] = React.useState(false);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [activeUserTab, setActiveUserTab] = useState(null);
  const params = `DeviceUserId=${userDeviceIdAsNumber}`;
  const [openExcelModal, setOpenExcelModal] = useState(false);

  useEffect(() => {
    fetchContacts(params);
  }, []);
  async function fetchContacts(param) {
    ApiUtils.getContacts(param)
      .then((res) => {
        setContactsData(res.data.data.listResponse);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const openUserInfo = (userinfo) => {
    setActiveUserTab(userinfo);
    const paramsForContacts = `DeviceUserId=${userDeviceIdAsNumber}&PhoneNumber=%2B${
      userinfo.mobileNumber
    }&PageSize=${10}`;
    const params = `DeviceUserId=${userDeviceIdAsNumber}&Page=${currentPageNumber}&PageSize=${10}&PhoneNumber=%2B${
      userinfo.mobileNumber
    }`;
    fetchContacts(paramsForContacts);
    fetchData(params);
  };
  const locationURL = location.pathname.substring(
    0,
    location.pathname.lastIndexOf("/")
  );
  function fetchData(params) {
    ApiUtils.getCallLogs(params)
      .then((res) => {
        setTotalCount(res.data.data.totalCount);
        const dataTable = res.data.data.listResponse.map((data, index) => ({
          ...data,
          id: index + 1,
        }));
        setCallLogData(dataTable);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const showLocationMap = (params) => {
    setCenter({
      lat: Number(params.row.latitude),
      lng: Number(params.row.longitude),
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const {
    childCheckedState,
    parentChecked,
    handleParentCheckboxChange,
    handleChildCheckboxChange,
    setParentChecked,
    setChildCheckedState,
  } = useCommonCheckbox(contactsData, "contactId");
  const handleDelete = async (data, setParentChecked, setChildCheckedState) => {
    // Call the CommonDeleteModal
    await CommonDeleteModal({
      data,
      fetchData: fetchContacts, // Refresh data after deletion
      onError: (error) => {
        console.error("Delete error:", error); // Handle errors
      },
      deleteFuntion: ApiUtils.DeleteRange,
      Url: "Contacts/DeleteRange",
      setParentChecked,
      setChildCheckedState,
      params,
    });
  };
  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "number", headerName: "Number", flex: 1 },
    {
      field: "callTypes",
      headerName: "Call Type",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {params.row.callTypes === "Incoming" ? (
            <Chip
              icon={
                <CallReceivedIcon sx={{ color: "red", fontSize: "16px" }} />
              }
              color="error"
              label={params.row.callTypes}
            />
          ) : (
            <Chip
              icon={<CallMadeIcon sx={{ color: "white", fontSize: "16px" }} />}
              color="success"
              label={params.row.callTypes}
            />
          )}
        </Box>
      ),
    },
    {
      field: "callDuration",
      flex: 1,
      headerName: "Call Duration",
    },
    {
      field: "time",
      flex: 1,
      headerName: "Time",
      valueGetter: (params) => {
        return extractTime(params.row.logDateTime);
      },
    },
    {
      field: "date",
      flex: 1,
      headerName: "Date",
      valueGetter: (params) => {
        return extractDate(params.row.logDateTime);
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 280,
      // flex: 1,
      getActions: (params) => [
        <audio
          src="https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
          controls
        />,
        <GridActionsCellItem
          icon={<LocationOnIcon />}
          label="map"
          onClick={() => showLocationMap(params)}
        />,
      ],
    },
  ];

  const handlePaginationModelChange = (page) => {
    setCurrentPageNumber(page.page + 1);
    setPaginationModel({
      ...paginationModel,
      page: page.page,
    });
  };
  function handleDownloadExcel() {
    ApiUtils.getContactDetailsByExcel(params)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "contacts-details.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  }

  return (
    <>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} md={7}>
          <MainCard content={false} title="Phone Contacts">
            <Grid
              container
              sx={{
                display: "flex",
                justifyContent: "space-between",

                alignItems: "center",
              }}
            >
              <div>
                <Checkbox
                  sx={{ ml: 3, mt: 2 }}
                  className="parentCheckbox"
                  type="checkbox"
                  checked={parentChecked}
                  onChange={handleParentCheckboxChange}
                />
              </div>
              <div>
                <Button
                  sx={{ mr: 2, mt: 2 }}
                  variant="contained"
                  color="primary"
                  onClick={() => handleDownloadExcel()}
                  size="large"
                  disabled={!(contactsData.length > 0)}
                >
                  Export Excel
                </Button>
                {/* <Grid item> */}
                <Button
                  sx={{ mr: 2, mt: 2 }}
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setOpenExcelModal(true)}
                >
                  Upload Data
                </Button>
                {childCheckedState?.length > 0 && (
                  <Button
                    sx={{ float: "right", mr: 2, mt: 2, background: "red" }}
                    variant="contained"
                    size="large"
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
              </div>
              {/* </Grid> */}
            </Grid>
            <CardContent>
              <Grid container spacing={gridSpacing}>
                <Grid item xs={12} className="contacts-list">
                  {contactsData.length > 0 ? (
                    contactsData.map((userinfo) => (
                      <React.Fragment key={userinfo.id}>
                        <Grid
                          item
                          className="single-contact"
                          onClick={() => {
                            openUserInfo(userinfo);
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <Checkbox
                                type="checkbox"
                                checked={childCheckedState?.includes(
                                  userinfo?.contactId
                                )}
                                onChange={(e) =>
                                  handleChildCheckboxChange(
                                    e,
                                    userinfo?.contactId
                                  )
                                }
                              />
                              <AccountBoxIcon
                                sx={{ color: "#1E88E5", fontSize: "21px" }}
                              />
                              <Typography variant="subtitle1" color="inherit">
                                {userinfo.name}
                              </Typography>
                            </Box>
                            <Typography>
                              <div>
                                <Button className="link-redirect">
                                  <FaTrash
                                    color="red"
                                    stroke={2}
                                    onClick={() => {
                                      handleDelete(
                                        [userinfo?.contactId],
                                        setParentChecked,
                                        setChildCheckedState
                                      );
                                    }}
                                  />
                                </Button>
                              </div>
                            </Typography>
                          </Box>
                        </Grid>
                        <Divider sx={{ my: 1.5 }} />
                      </React.Fragment>
                    ))
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
              </Grid>
            </CardContent>
          </MainCard>
        </Grid>
        {activeUserTab !== null && locationURL === "/user/contacts" && (
          <Grid item xs={12} md={5}>
            <MainCard content={false} title="User Information">
              <CardContent>
                <Grid
                  container
                  direction="column"
                  className="contacts-list-info"
                >
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <BadgeIcon sx={{ color: "#1E88E5", fontSize: "21px" }} />

                      <Typography variant="subtitle1" color="inherit">
                        Name
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Typography variant="subtitle1" color="inherit">
                            {activeUserTab?.name}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 1.5 }} />

                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <PhoneIcon sx={{ color: "#1E88E5", fontSize: "21px" }} />

                      <Typography variant="subtitle1" color="inherit">
                        Mobile Number
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Typography variant="subtitle1" color="inherit">
                            {activeUserTab?.mobileNumber}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* <Divider sx={{ my: 1.5 }} />
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <HomeWorkIcon
                        sx={{ color: "#1E88E5", fontSize: "21px" }}
                      />

                      <Typography variant="subtitle1" color="inherit">
                        Home Number
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Typography variant="subtitle1" color="inherit">
                            {activeUserTab?.homeNumber}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 1.5 }} />
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <ApartmentIcon
                        sx={{ color: "#1E88E5", fontSize: "21px" }}
                      />

                      <Typography variant="subtitle1" color="inherit">
                        Office Number
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Typography variant="subtitle1" color="inherit">
                            {activeUserTab?.officeNumber}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid> */}
                  <Divider sx={{ my: 1.5 }} />
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid
                      item
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <EmailIcon sx={{ color: "#1E88E5", fontSize: "21px" }} />

                      <Typography variant="subtitle1" color="inherit">
                        Email
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Typography variant="subtitle1" color="inherit">
                            {activeUserTab?.email}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 1.5 }} />
                </Grid>
              </CardContent>
            </MainCard>
            {/* <Divider sx={{ my: 1.5 }} /> */}
          </Grid>
        )}
        {activeUserTab !== null && locationURL === "/user/contacts" && (
          <Grid item xs={12}>
            <MainCard
              content={false}
              title={`${activeUserTab.name}'s Call History`}
            >
              <CardContent>
                <Grid container spacing={2}>
                  {/* <Custom onSearch={handleSearch} /> */}
                </Grid>
                <Box
                  sx={{
                    py: 2,
                    width: "100%",
                    overflowX: "hidden",
                    borderBottom: "none",
                    height: "500px",
                  }}
                >
                  <CustomDataGridTable
                    columns={columns}
                    rows={callLogData}
                    pagination={true}
                    hideFooter={false}
                    rowCount={totalCount}
                    onPaginationModelChange={handlePaginationModelChange}
                    paginationModel={paginationModel}
                  />
                </Box>
              </CardContent>
            </MainCard>
          </Grid>
        )}
      </Grid>
      <Modal
        keepMounted
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: "15px",
            }}
          >
            <Typography id="modal-modal-title" variant="h2" component="h2">
              Location
            </Typography>
            <CloseIcon className="close-icon-modal" onClick={handleClose} />
          </Box>

          <Grid item xs={12}>
            <LocationMap center={center} />
          </Grid>
        </Box>
      </Modal>
      <CommonModal
        userDeviceId={userDeviceIdAsNumber}
        open={openExcelModal}
        setOpenExcelModal={setOpenExcelModal}
        title="Contact Logs  Import"
        fetchData={fetchContacts}
        Url="Contacts/BulkImport"
        params={params}
      />
    </>
  );
};

Contacts.propTypes = {
  isLoading: PropTypes.bool,
};

export default Contacts;
