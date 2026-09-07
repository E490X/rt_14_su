import React, { useState } from "react";
import Box from "@mui/material/Box";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import {
  extractDate,
  extractTime,
  formatDate,
  formatTimestampToTime,
} from "helper/GetDateTimeFormat";
import { Typography, Grid, CardContent, Checkbox, Button } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import CustomDataGridTable from "helper/CustomDataGridTable";
import CustomDatePicker from "helper/CustomDatePicker";
import AndroidIcon from "@mui/icons-material/Android";
import { useFetchData } from "helper/useFetchData";
import { GET_INSTALLED_APPS_LOGS } from "config/ApiNameConstant";
import CommonDeleteModal from "views/CommonDeleteModal";
import useCommonCheckbox from "views/useCommonCheckbox";
import { FaTrash } from "react-icons/fa6";
import CommonModal from "views/CommonModal";
import ApiUtils from "api/ApiUtils";
import { getParamUrl } from "helper/UrlHelper";
const InstalledApps = () => {
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
  const [openExcelModal, setOpenExcelModal] = React.useState(false);
  const { totalCount, data, fetchData } = useFetchData(
    GET_INSTALLED_APPS_LOGS,
    params,
    currentPageNumber
  );
  const {
    childCheckedState,
    parentChecked,
    handleParentCheckboxChange,
    handleChildCheckboxChange,
    setParentChecked,
    setChildCheckedState,
  } = useCommonCheckbox(data, "installedAppId");
  const handleDelete = async (data, setParentChecked, setChildCheckedState) => {
    // Call the CommonDeleteModal
    await CommonDeleteModal({
      data,
      fetchData, // Refresh data after deletion
      onError: (error) => {
        console.error("Delete error:", error); // Handle errors
      },
      deleteFuntion: ApiUtils.DeleteRange,
      Url: "InstalledApp/DeleteRange",
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
            checked={childCheckedState?.includes(params?.row?.installedAppId)}
            onChange={(e) =>
              handleChildCheckboxChange(e, params?.row?.installedAppId)
            }
          />
        </div>
      ),
    },
    {
      field: "installedAppName",
      headerName: "Application Name",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* <AndroidIcon sx={{ color: "#1E88E5", fontSize: "18px" }} /> */}
          <Typography
            sx={{ fontSize: "0.875rem", color: "#616161" }}
            variant="subtitle2"
          >
            {params.row.installedAppName}
          </Typography>
        </Box>
      ),
    },
    { field: "appSize", headerName: "App Size", flex: 1 },
    // { field: "version", headerName: "Version", flex: 1 },
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
                  [params?.row?.installedAppId],
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
      <MainCard content={false} title="Installed Apps List">
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
        title="Installed Apps List Import"
        fetchData={fetchData}
        Url="InstalledApp/BulkImport"
      />
    </>
  );
};

export default InstalledApps;
