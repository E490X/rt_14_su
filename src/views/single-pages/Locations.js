import { Button, CardContent, Checkbox, Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import MainCard from "ui-component/cards/MainCard";
import { gridSpacing } from "store/constant";
import LocationMap from "helper/LocationMap";
import CustomDataGridTable from "helper/CustomDataGridTable";
import { useParams } from "react-router-dom";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ApiUtils from "api/ApiUtils";
import Modal from "@mui/material/Modal";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";

import {
  extractDate,
  extractTime,
  formatDate,
  formatTimestampToTime,
} from "helper/GetDateTimeFormat";
import CustomDatePicker from "helper/CustomDatePicker";
import { useFetchData } from "helper/useFetchData";
import { GET_LOCATION_LOGS } from "config/ApiNameConstant";
import CommonDeleteModal from "views/CommonDeleteModal";
import useCommonCheckbox from "views/useCommonCheckbox";
import { FaTrash } from "react-icons/fa6";
import CommonModal from "views/CommonModal";

import { getParamUrl } from "helper/UrlHelper";

import OpenStreetMap from "./OpenStreetMap";
import MultiLocationMap from "./MultiLocationMap";

function Locations() {
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
  const urlParam = useParams();
  const userDeviceIdAsNumber = urlParam.userDeviceId;
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [openExcelModal, setOpenExcelModal] = React.useState(false);

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [multiLocationMarker, setMultiLocationMarker] = useState([]);
  const [show, setShow] = useState(false);
  const [filterModel, setFilterModel] = useState({
    fromDate: '',
    toDate: '',
  });
  let params = getParamUrl(filterModel,
    userDeviceIdAsNumber,
    currentPageNumber);

  const { totalCount, data, fetchData } = useFetchData(
    GET_LOCATION_LOGS,
    params,
    currentPageNumber
  );
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDcjtGb2jSVKXsUjxVAcJx6hboHbUe6fqI",
  });
  const {
    childCheckedState,
    parentChecked,
    handleParentCheckboxChange,
    handleChildCheckboxChange,
    setParentChecked,
    setChildCheckedState,
  } = useCommonCheckbox(data, "locationId");
  const handleDelete = async (data, setParentChecked, setChildCheckedState) => {
    // Call the CommonDeleteModal
    await CommonDeleteModal({
      data,
      fetchData, // Refresh data after deletion
      onError: (error) => {
        console.error("Delete error:", error); // Handle errors
      },
      deleteFuntion: ApiUtils.DeleteRange,
      Url: "Location/DeleteRange",
      setParentChecked,
      setChildCheckedState,
    });
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
            checked={childCheckedState?.includes(params?.row?.locationId)}
            onChange={(e) =>
              handleChildCheckboxChange(e, params?.row?.locationId)
            }
          />
        </div>
      ),
    },
    { field: "latitude", headerName: "Latitude", flex: 1 },
    { field: "longitude", headerName: "Longitude", flex: 1 },
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
    // {
    //   field: "discount",
    //   editable: true,
    //   width: 100,
    //   valueOptions: ({ row }) => {
    //     if (row === undefined) {
    //       return ["EU-resident", "junior"];
    //     }
    //     const options = [];
    //     if (!["United Kingdom", "Brazil"].includes(row.country)) {
    //       options.push("EU-resident");
    //     }
    //     if (row.age < 27) {
    //       options.push("junior");
    //     }
    //     return options;
    //   },
    // },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 80,
      flex: 1,
      getActions: (params) => [
        <>
          <GridActionsCellItem
            icon={<LocationOnIcon sx={{ color: "#616161" }} />}
            label="map"
            onClick={() =>
              setCenter({
                lat: Number(params.row.latitude),
                lng: Number(params.row.longitude),
              })
            }
          />

          <Button className="link-redirect">
            <FaTrash
              color="red"
              stroke={2}
              onClick={() => {
                handleDelete(
                  [params?.row?.locationId],
                  setParentChecked,
                  setChildCheckedState
                );
              }}
            />
          </Button>
        </>,
      ],
    },
  ];

  const showAllSearchedLocation = (fromDateISOString, toDateISOString) => {
    const paramsFilterData = `DeviceUserId=${userDeviceIdAsNumber}&FromDate=${fromDateISOString}&ToDate=${toDateISOString}`;
    ApiUtils.getLocationInfo(paramsFilterData)
      .then((res) => {
        const mappedData = res.data.data.listResponse.map((data) => {
          return {
            position: {
              lat: Number(data.latitude),
              lng: Number(data.longitude),
            },
          };
        });
        setMultiLocationMarker(mappedData);
        setShow(true);
      })
      .catch((err) => {
        console.log("ðŸš€ ~ file: Location.tsx:45 ~ useEffect ~ err:", err);
      });
  };
  if (!isLoaded) return <div>Loading...</div>;
  const handleClose = () => {
    setShow(false);
  };
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
      <MainCard content={false} title="User Locations">
        <CardContent>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={4}>
              
              <OpenStreetMap center={center} />
              {/* <LocationMap center={center} /> */}
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                  <Grid container justifyContent="start" gap="14px">
                    <CustomDatePicker
                      onSearch={handleSearch}
                      onOpenMapModal={showAllSearchedLocation}
                    />
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
            </Grid>
          </Grid>
        </CardContent>
      </MainCard>
      <Modal
        keepMounted
        open={show}
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
            <MultiLocationMap markers={multiLocationMarker} />
          </Grid>
        </Box>
      </Modal>

      <CommonModal
        userDeviceId={userDeviceIdAsNumber}
        open={openExcelModal}
        setOpenExcelModal={setOpenExcelModal}
        title="User Locations  Import"
        fetchData={fetchData}
        Url="Location/BulkImport"
        isScheduleEnabled={true}
        fileType={7}
      />
    </>
  );
}

// function MultiLocationMap({ markers }) {
//   const handleOnLoad = (map) => {
//     const bounds = new google.maps.LatLngBounds();
//     markers.forEach(({ position }) => bounds.extend(position));
//     map.fitBounds(bounds);
//   };

//   return (

//     <GoogleMap
//       onLoad={handleOnLoad}
//       zoom={10}
//       mapContainerClassName="map-container-multilocation-map"
//     >
//       {markers.map((mark, index) => (
//         <MarkerF key={index} position={mark.position} />
//       ))}
//     </GoogleMap>
 

//   );
// }

export default Locations;
