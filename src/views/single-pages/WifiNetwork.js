import React, { useState } from "react";
import Box from "@mui/material/Box";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { Typography, Grid, CardContent, Button, Checkbox } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import CustomDataGridTable from "helper/CustomDataGridTable";
import CustomDatePicker from "helper/CustomDatePicker";
import Wifi1BarIcon from "@mui/icons-material/Wifi1Bar";
import Wifi2BarIcon from "@mui/icons-material/Wifi2Bar";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { useFetchData } from "helper/useFetchData";
import { GET_WIFI_NETWROK_LOGS } from "config/ApiNameConstant";
import CommonModal from "views/CommonModal";
import { FaTrash } from "react-icons/fa6";
import useCommonCheckbox from "views/useCommonCheckbox";
import CommonDeleteModal from "views/CommonDeleteModal";
import ApiUtils from "api/ApiUtils";
import { getParamUrl } from "helper/UrlHelper";
const WifiNetwork = () => {
  const urlParam = useParams();
  const userDeviceIdAsNumber = urlParam.userDeviceId;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [filterModel, setFilterModel] = useState({
    fromDate: '',
    toDate: '',
  });
  let params = getParamUrl(filterModel,
    userDeviceIdAsNumber,
    currentPageNumber);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const { totalCount, data, fetchData } = useFetchData(
    GET_WIFI_NETWROK_LOGS,
    params,
    currentPageNumber
  );
  const [openExcelModal, setOpenExcelModal] = React.useState(false);
  const {
    childCheckedState,
    parentChecked,
    handleParentCheckboxChange,
    handleChildCheckboxChange,
    setParentChecked,
    setChildCheckedState,
  } = useCommonCheckbox(data, "wiFINetworkId");
  const handleDelete = async (data, setParentChecked, setChildCheckedState) => {
    // Call the CommonDeleteModal
    await CommonDeleteModal({
      data,
      fetchData, // Refresh data after deletion
      onError: (error) => {
        console.error("Delete error:", error); // Handle errors
      },
      deleteFuntion: ApiUtils.DeleteRange,
      Url: "WiFiNetworks/DeleteRange",
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
            checked={childCheckedState?.includes(params?.row?.wiFINetworkId)}
            onChange={(e) =>
              handleChildCheckboxChange(e, params?.row?.wiFINetworkId)
            }
          />
        </div>
      ),
    },
    {
      field: "wiFINetworkName",
      headerName: "Network Name",
      flex: 1,
      // renderCell: (params) => (
      //   <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      //     <WifiPasswordIcon sx={{ color: "#1E88E5", fontSize: "18px" }} />
      //     <Typography
      //       sx={{ fontSize: "0.875rem", color: "#616161" }}
      //       variant="subtitle2"
      //     >
      //       {params.row.wiFINetworkName}
      //     </Typography>
      //   </Box>
      // ),
    },
    {
      field: "strength",
      headerName: "Signal Strength",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!params.row.strength ? (
            <WifiOffIcon sx={{ color: "#1E88E5", fontSize: "18px" }} />
          ) : params.row.strength <= -71 && params.row.strength >= -90 ? (
            <Wifi1BarIcon sx={{ color: "#1E88E5", fontSize: "18px" }} />
          ) : params.row.strength <= -51 && params.row.strength >= -70 ? (
            <Wifi2BarIcon sx={{ color: "#1E88E5", fontSize: "18px" }} />
          ) : params.row.strength <= -30 && params.row.strength >= -50 ? (
            <WifiIcon sx={{ color: "#1E88E5", fontSize: "18px" }} />
          ) : params.row.strength <= -90 ? (
            <Wifi1BarIcon sx={{ color: "#1E88E5", fontSize: "18px" }} />
          ) : (
            ""
          )}

          <Typography
            sx={{ fontSize: "0.875rem", color: "#616161" }}
            variant="subtitle2"
          >
            {params.row.strength}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      type: "actions",
      renderCell: (params) => (
        <div>
          <Button className="link-redirect">
            <FaTrash
              color="red"
              stroke={2}
              onClick={() => {
                handleDelete(
                  [params?.row?.wiFINetworkId],
                  setParentChecked,
                  setChildCheckedState
                );
              }}
            />
          </Button>
        </div>
      ),
    },
  ];
  const handlePaginationModelChange = (page) => {
    setCurrentPageNumber(page.page + 1);
    setPaginationModel({
      ...paginationModel,
      page: page.page,
    });
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

  return (
    <>
      <MainCard content={false} title="Wifi Networks List">
        <CardContent>
          <Grid container spacing={2}>
            <CustomDatePicker onSearch={handleSearch} />
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
      <CommonModal
        userDeviceId={userDeviceIdAsNumber}
        open={openExcelModal}
        setOpenExcelModal={setOpenExcelModal}
        title="Wifi Networks List Import"
        fetchData={fetchData}
        Url="WiFiNetworks/BulkImport"
      />
    </>
  );
};

export default WifiNetwork;
