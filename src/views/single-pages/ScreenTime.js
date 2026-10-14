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
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import MainCard from "ui-component/cards/MainCard";
import { useParams } from "react-router-dom";
import { gridSpacing } from "store/constant";
import CustomDataGridTable from "helper/CustomDataGridTable";
// import { formatTimestampToTime } from "helper/GetDateTimeFormat";
import AndroidIcon from "@mui/icons-material/Android";
import { useFetchData } from "helper/useFetchData";
import { GET_SCREEN_TIME_DETAILS } from "config/ApiNameConstant";
import ApiUtils from "api/ApiUtils";
import CustomDatePicker from "helper/CustomDatePicker";
import CommonModal from "views/CommonModal";
import useCommonCheckbox from "views/useCommonCheckbox";
import CommonDeleteModal from "views/CommonDeleteModal";
import { FaTrash } from "react-icons/fa6";
ChartJS.register(ArcElement, Tooltip, Legend);

const ScreenTime = () => {
  const urlParam = useParams();
  const userDeviceIdAsNumber = Number(urlParam.userDeviceId);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const paramsForList = `DeviceUserId=${userDeviceIdAsNumber}&Page=${currentPageNumber}&PageSize=${10}`;
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [topFiveApp, setTopFiveApp] = useState([]);
  const [totalTime, setTotalTime] = useState(null);
  const [totalScreenTime, setTotalScreenTime] = useState(null);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const { totalCount, data, fetchData } = useFetchData(
    GET_SCREEN_TIME_DETAILS,
    paramsForList,
    currentPageNumber
  );
  useEffect(() => {
    if (toDate === fromDate) {
      const yesterday = new Date(fromDate);
      yesterday.setDate(yesterday.getDate() - 1);
      setToDate(new Date(toDate).toISOString());
      const paramsForTop = `DeviceUserId=${userDeviceIdAsNumber}&Page=${currentPageNumber}&PageSize=${10}&FromDate=${new Date(
        yesterday
      ).toISOString()}&ToDate=${toDate}`;
      fetchTopFiveApp(paramsForTop);
    } else {
      setFromDate(new Date(fromDate).toISOString());
      setToDate(new Date(toDate).toISOString());
      const paramsForTop = `DeviceUserId=${userDeviceIdAsNumber}&Page=${currentPageNumber}&PageSize=${10}&FromDate=${fromDate}&ToDate=${toDate}`;
      fetchTopFiveApp(paramsForTop);
    }
  }, [fromDate, toDate]);
  const fetchTopFiveApp = (params) => {
    ApiUtils.getTopAppScreenTime(params)
      .then((res) => {
        if (res.status === 200) {
          setTopFiveApp(res.data.data.appName);
          setTotalTime(res.data.data.totalTime);
          setTotalScreenTime(res.data.data.totalScreenTime);
        }
      })
      .catch((err) => console.log(err));
  };

  // Top 5 apps by screen time usage (app-wise division), from the real API data
  const APP_USAGE_BLUE_TONES = ["#0D47A1", "#1565C0", "#1E88E5", "#64B5F6", "#BBDEFB"];
  const [topFiveAppsUsage, setTopFiveAppsUsage] = useState([]);

  useEffect(() => {
    const paramsForScreenTime = `DeviceUserId=${userDeviceIdAsNumber}&Page=1&PageSize=10000`;
    ApiUtils.getScreenTimeDetail(paramsForScreenTime)
      .then((res) => {
        const logs = res?.data?.data?.listResponse || [];
        const appUsageMap = new Map();

        logs.forEach((log) => {
          const appName = log.appName;
          if (!appName) return;
          const duration = Number(log.screenTimeDuration) || 0;
          appUsageMap.set(appName, (appUsageMap.get(appName) || 0) + duration);
        });

        const sortedApps = Array.from(appUsageMap.entries())
          .map(([appName, screenTimeDuration]) => ({ appName, screenTimeDuration }))
          .sort((a, b) => b.screenTimeDuration - a.screenTimeDuration)
          .slice(0, 5)
          .map((app, index) => ({
            ...app,
            color: APP_USAGE_BLUE_TONES[index],
          }));

        setTopFiveAppsUsage(sortedApps);
      })
      .catch((err) => console.log(err));
  }, [userDeviceIdAsNumber]);

  const screenTimeLegend = topFiveAppsUsage.map((app) => ({
    label: app.appName,
    value: app.screenTimeDuration,
    color: app.color,
  }));

  const chartData = {
    labels: screenTimeLegend.map((item) => item.label),
    datasets: [
      {
        label: "Total",
        data: screenTimeLegend.map((item) => item.value),
        backgroundColor: screenTimeLegend.map((item) => item.color),
        borderColor: screenTimeLegend.map((item) => item.color),
        borderWidth: 1,
      },
    ],
  };

  const timeFormat = (time) => {
    const totalSeconds = parseInt(time) * 60; // Convert minutes to seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formattedTime = "";

    if (hours > 0) {
      formattedTime += `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }

    if (minutes > 0 || hours > 0) {
      formattedTime += ` ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
    }

    if (seconds > 0 || (hours === 0 && minutes === 0)) {
      formattedTime += ` ${seconds} ${seconds === 1 ? "second" : "seconds"}`;
    }

    return formattedTime.trim();
  };
  const [openExcelModal, setOpenExcelModal] = React.useState(false);

  const {
    childCheckedState,
    parentChecked,
    handleParentCheckboxChange,
    handleChildCheckboxChange,
    setParentChecked,
    setChildCheckedState,
  } = useCommonCheckbox(data, "screenTimeId");
  const handleDelete = async (data, setParentChecked, setChildCheckedState) => {
    // Call the CommonDeleteModal
    const deleteResponse = await CommonDeleteModal({
      data,
      fetchData, // Refresh data after deletion
      onError: (error) => {
        console.error("Delete error:", error); // Handle errors
      },
      deleteFuntion: ApiUtils.DeleteRange,
      Url: "ScreenTime/DeleteRange",
      setParentChecked,
      setChildCheckedState,
    });
    if (deleteResponse === undefined) {
      setToDate(new Date());
    }
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
            checked={childCheckedState?.includes(params?.row?.screenTimeId)}
            onChange={(e) =>
              handleChildCheckboxChange(e, params?.row?.screenTimeId)
            }
          />
        </div>
      ),
    },
    {
      field: "appName",
      headerName: "Application Name",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <AndroidIcon sx={{ color: "#1E88E5", fontSize: "18px" }} />
          <Typography
            sx={{ fontSize: "0.875rem", color: "#616161" }}
            variant="subtitle2"
          >
            {params.row.appName}
          </Typography>
        </Box>
      ),
    },
    {
      field: "screenTimeDuration",
      flex: 1,
      headerName: "Time",
      valueGetter: (params) => {
        return timeFormat(params.row.screenTimeDuration);
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
                  [params?.row?.screenTimeId],
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
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${timeFormat(context.parsed)}`,
        },
      },
    },
  };
  const handlePaginationModelChange = (page) => {
    setCurrentPageNumber(page.page + 1);
    setPaginationModel({
      ...paginationModel,
      page: page.page,
    });
  };
  const handleSearch = (fromDateISOString, toDateISOString) => {
    const paramsFilterData = `DeviceUserId=${userDeviceIdAsNumber}&Page=${currentPageNumber}&PageSize=${10}&FromDate=${fromDateISOString}&ToDate=${toDateISOString}`;
    if (fromDateISOString && toDateISOString) {
      fetchTopFiveApp(paramsFilterData);
    }
  };
  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
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
      {/* <CustomDatePicker onSearch={handleSearch} data={data} /> */}
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} md={6}>
          <MainCard content={false} title="Top 5 Launched Apps (frequency)">
            <CardContent className="top-five-app">
              {topFiveApp?.map((userinfo, i) => {
                return (
                  <>
                    <Grid item className="single-contact" key={i}>
                      <Typography variant="subtitle1" color="inherit">
                        {userinfo}
                      </Typography>
                    </Grid>
                    <Divider sx={{ my: 1.5 }} />
                  </>
                );
              })}
            </CardContent>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <MainCard content={false} title="Total Screen Time">
            <CardContent className="contacts-list">
              <Box sx={{ width: "280px", height: "280px", margin: "0 auto" }}>
                {topFiveAppsUsage.length > 0 ? (
                  <Pie data={chartData} options={options} />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      backgroundColor: "#2196F3",
                    }}
                  />
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                {screenTimeLegend.map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 0.75,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: item.color,
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {timeFormat(item.value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard content={false} title="Most Used Apps (duration)">
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
        </Grid>
      </Grid>

      <CommonModal
        userDeviceId={userDeviceIdAsNumber}
        open={openExcelModal}
        setOpenExcelModal={setOpenExcelModal}
        title="ScreenTime Data Import"
        fetchData={fetchData}
        Url="ScreenTime/BulkImport"
        setToDate={setToDate}
      />
    </>
  );
};

ScreenTime.propTypes = {
  isLoading: PropTypes.bool,
};

export default ScreenTime;
