import React, { useState } from "react";
import Box from "@mui/material/Box";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { gridSpacing } from "store/constant";
import ApiUtils from "api/ApiUtils";
import Modal from "@mui/material/Modal";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import {
  extractDate,
  formatDate,
  formatTimestampToTime,
} from "helper/GetDateTimeFormat";
import { Button, Typography, Grid, CardContent, Checkbox } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import LocationMap from "helper/LocationMap";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CustomDataGridTable from "helper/CustomDataGridTable";
import { useFetchData } from "helper/useFetchData";
import { GET_CALENDAR_DETAILS } from "config/ApiNameConstant";
import CustomDatePicker from "helper/CustomDatePicker";
import CommonDeleteModal from "views/CommonDeleteModal";
import useCommonCheckbox from "views/useCommonCheckbox";
import CommonModal from "views/CommonModal";
import { FaTrash } from "react-icons/fa6";
import { getParamUrl } from "helper/UrlHelper";
const CalendarLogs = () => {
  const urlParam = useParams();
  const userDeviceIdAsNumber = urlParam.userDeviceId;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [filterModel, setFilterModel] = useState({
    fromDate: '',
    toDate: '',
  });
  let params = getParamUrl(filterModel,
    userDeviceIdAsNumber,
    currentPageNumber);
  const { totalCount, data, fetchData } = useFetchData(
    GET_CALENDAR_DETAILS,
    params,
    currentPageNumber
  );
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [openExcelModal, setOpenExcelModal] = React.useState(false);

  const {
    childCheckedState,
    parentChecked,
    handleParentCheckboxChange,
    handleChildCheckboxChange,
    setParentChecked,
    setChildCheckedState,
  } = useCommonCheckbox(data, "calendarId");
  const handleDelete = async (data, setParentChecked, setChildCheckedState) => {
    // Call the CommonDeleteModal
    await CommonDeleteModal({
      data,
      fetchData, // Refresh data after deletion
      onError: (error) => {
        console.error("Delete error:", error); // Handle errors
      },
      deleteFuntion: ApiUtils.DeleteRange,
      Url: "Calendar/DeleteRange",
      setParentChecked,
      setChildCheckedState,
    });
  };
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const showLocationMap = (params) => {
    setCenter({
      lat: Number(params.row.latitude),
      lng: Number(params.row.longitude),
    });
    setOpen(true);
  };
  const columns = [
    {
      field: "parentBox", // Give the column a unique ID
      headerName: (
        <Checkbox
          className="parentCheckbox"
          type="checkbox"
          checked={parentChecked}
          onChange={handleParentCheckboxChange}
        />
      ),
      flex: 1,
      type: "actions",
      renderCell: (params) => (
        <div>
          <Checkbox
            type="checkbox"
            checked={childCheckedState?.includes(params?.row?.calendarId)}
            onChange={(e) =>
              handleChildCheckboxChange(e, params?.row?.calendarId)
            }
          />
        </div>
      ),
    },
    {
      field: "title",
      headerName: "Event Name",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CalendarMonthIcon sx={{ color: "#5e35b1", fontSize: "18px" }} />
          <Typography
            sx={{ fontSize: "0.875rem", color: "#616161" }}
            variant="subtitle2"
          >
            {params.row.title}
          </Typography>
        </Box>
      ),
    },
    { field: "time", headerName: "Time", flex: 1 },
    {
      field: "calenderLogTime",
      headerName: "Date",
      flex: 1,
      valueGetter: (params) => {
        return extractDate(params.row.calenderLogTime);
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      type: "Delete",
      renderCell: (params) => (
        <div>
          <Button className="link-redirect">
            <FaTrash
              color="red"
              stroke={2}
              onClick={() => {
                handleDelete(
                  [params?.row?.calendarId],
                  setParentChecked,
                  setChildCheckedState
                );
              }}
            />
          </Button>
        </div>
      ),
    },

    // {
    //   field: "date",
    //   flex: 1,
    //   headerName: "Date",
    //   valueGetter: (params) => {
    //     return formatDate(params.row.logDateTime);
    //   },
    // },
    // {
    //   field: "actions",
    //   headerName: "View on Map",
    //   type: "actions",
    //   flex: 1,
    //   getActions: (params) => [
    //     <GridActionsCellItem
    //       icon={<LocationOnIcon />}
    //       label="map"
    //       onClick={() => showLocationMap(params)}
    //     />,
    //   ],
    // },
  ];

  const handleSearch = (fromDateISOString, toDateISOString) => {
    let filterData = {
      fromDate: fromDateISOString,
      toDate: toDateISOString
    }
    setFilterModel({
      fromDate: fromDateISOString,
      toDate: toDateISOString
    });
    let paramUrl = getParamUrl(filterData,
      userDeviceIdAsNumber,
      currentPageNumber
    );

    fetchData(paramUrl);
  };
  const handlePaginationModelChange = (page) => {
    setCurrentPageNumber(page.page + 1);
    setPaginationModel({
      ...paginationModel,
      page: page.page,
    });
  };

  return (
    <>
      <MainCard content={false} title="Calendar Logs">
        <CardContent>
          <Grid container spacing={2}>
            <CustomDatePicker onSearch={handleSearch} data={data} />
            <Grid item>
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
              rows={data}
              pagination={true}
              hideFooter={false}
              rowCount={totalCount}
              onPaginationModelChange={handlePaginationModelChange}
              paginationModel={paginationModel}
            />
          </Box>
        </CardContent>
      </MainCard>
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
        title="Calendar Logs Data Import"
        fetchData={fetchData}
        Url="Calendar/BulkImport"
      />
    </>
  );
};

export default CalendarLogs;
