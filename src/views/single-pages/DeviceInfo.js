import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Avatar,
  CardContent,
  Divider,
  Grid,
  Typography,
  Box,
  Button,
} from "@mui/material";

import MainCard from "ui-component/cards/MainCard";
import { gridSpacing } from "store/constant";
import { useParams } from "react-router-dom";
import ApiUtils from "api/ApiUtils";
import Battery60Icon from "@mui/icons-material/Battery60";
import WifiIcon from "@mui/icons-material/Wifi";
import NetworkCellIcon from "@mui/icons-material/NetworkCell";
import ListIcon from "@mui/icons-material/List";
import PersonalVideoIcon from "@mui/icons-material/PersonalVideo";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { useDispatch } from "react-redux";
import { setimeiNumber } from "store/reducers/deviceDataSlice";
import CustomDataGridTable from "helper/CustomDataGridTable";
import { extractDate, extractTime } from "helper/GetDateTimeFormat";
import { useFetchData } from "helper/useFetchData";
import { GET_LOCATION_LOGS } from "config/ApiNameConstant";
import OpenStreetMap from "./OpenStreetMap";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DeviceInfo = () => {
  const theme = useTheme();
  const urlParam = useParams();
  const userDeviceIdAsNumber = Number(urlParam.userDeviceId);
  const [deviceData, setDeviceData] = useState();
  const params = `DeviceUserId=${userDeviceIdAsNumber}`;
  const dispatch = useDispatch();
  useEffect(() => {
    ApiUtils.getDeviceInfo(params)
      .then((res) => {
        setDeviceData(res.data.data);
        dispatch(setimeiNumber(res.data.data?.imeiNumber));
        localStorage.setItem("imeiNumber", res.data.data?.imeiNumber);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Location table & map states (last 3 locations only)
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(5);
  const locationParams = `DeviceUserId=${userDeviceIdAsNumber}&Page=1&PageSize=3`;
  const { data: locationData } = useFetchData(
    GET_LOCATION_LOGS,
    locationParams,
    1
  );

  const locationColumns = [
    { field: "latitude", headerName: "Latitude", flex: 1 },
    { field: "longitude", headerName: "Longitude", flex: 1 },
    {
      field: "time",
      flex: 1,
      headerName: "Time",
      valueGetter: (params) => extractTime(params.row.logDateTime),
    },
    {
      field: "date",
      flex: 1,
      headerName: "Date",
      valueGetter: (params) => extractDate(params.row.logDateTime),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 80,
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<LocationOnIcon sx={{ color: "#616161" }} />}
          label="map"
          onClick={() => {
            setCenter({
              lat: Number(params.row.latitude),
              lng: Number(params.row.longitude),
            });
            setZoom(17);
          }}
        />,
      ],
    },
    {
      field: "view",
      headerName: "",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            window.open(
              `https://www.google.com/maps?q=${params.row.latitude},${params.row.longitude}`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
        >
          View
        </Button>
      ),
    },
  ];

  // Top 10 callers (all time), with each caller's last call datetime
  const [topCallers, setTopCallers] = useState([]);

  useEffect(() => {
    const paramsForCallLogs = `DeviceUserId=${userDeviceIdAsNumber}&Page=1&PageSize=10000`;
    ApiUtils.getCallLogs(paramsForCallLogs)
      .then((res) => {
        const logs = res?.data?.data?.listResponse || [];
        const callerMap = new Map();

        logs.forEach((log) => {
          const key = log.number || log.name;
          if (!key) return;

          if (!callerMap.has(key)) {
            callerMap.set(key, {
              name: log.name,
              number: log.number,
              callCount: 0,
              lastCallDateTime: log.logDateTime,
            });
          }

          const caller = callerMap.get(key);
          caller.callCount += 1;

          if (new Date(log.logDateTime) > new Date(caller.lastCallDateTime)) {
            caller.lastCallDateTime = log.logDateTime;
          }
        });

        const sortedCallers = Array.from(callerMap.values())
          .sort((a, b) => b.callCount - a.callCount)
          .slice(0, 10)
          .map((caller, index) => ({ ...caller, id: index + 1 }));

        setTopCallers(sortedCallers);
      })
      .catch((err) => console.log(err));
  }, [userDeviceIdAsNumber]);

  const callColumns = [
    { field: "name", headerName: "Contact Name", flex: 1 },
    { field: "number", headerName: "Number", flex: 1 },
    { field: "callCount", headerName: "Call Count", flex: 1 },
    {
      field: "lastCall",
      headerName: "Last Call",
      flex: 1,
      valueGetter: (params) =>
        `${extractDate(params.row.lastCallDateTime)} ${extractTime(
          params.row.lastCallDateTime
        )}`,
    },
  ];

  // Top 5 apps by screen time usage (app-wise division), from the real API data
  const APP_USAGE_BLUE_TONES = ["#0D47A1", "#1565C0", "#1E88E5", "#64B5F6", "#BBDEFB"];
  const [topFiveApps, setTopFiveApps] = useState([]);

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

        setTopFiveApps(sortedApps);
      })
      .catch((err) => console.log(err));
  }, [userDeviceIdAsNumber]);

  const screenTimeLegend = topFiveApps.map((app) => ({
    label: app.appName,
    value: app.screenTimeDuration,
    color: app.color,
  }));

  const screenTimeChartData = {
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

  const screenTimeChartOptions = {
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

  const timeFormat = (time) => {
    const totalSeconds = parseInt(time) * 60 || 0;
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

  return (
    <>
      <MainCard content={false} title="Device Information">
        <CardContent>
          <Grid container spacing={gridSpacing}>
            {deviceData ? (
              <Grid item xs={12}>
                <Grid container direction="column">
                  <Grid item>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="subtitle1" color="inherit">
                          Device Name
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
                              {deviceData?.deviceName}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 27,
                                height: 27,
                                borderRadius: "5px",
                                backgroundColor: theme.palette.success.light,
                                color: theme.palette.success.dark,
                                ml: 2,
                              }}
                            >
                              <PhoneIphoneIcon
                                fontSize="small"
                                color="inherit"
                              />
                            </Avatar>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Grid container direction="column">
                  <Grid item>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="subtitle1" color="inherit">
                          Device Model
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
                              {deviceData?.model}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 27,
                                height: 27,
                                borderRadius: "5px",
                                backgroundColor: theme.palette.orange.light,
                                color: theme.palette.orange.dark,
                                marginLeft: 1.875,
                              }}
                            >
                              <SmartphoneIcon
                                fontSize="small"
                                color="inherit"
                              />
                            </Avatar>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Grid container direction="column">
                  <Grid item>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="subtitle1" color="inherit">
                          Device OS Version
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
                              {deviceData?.version}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 27,
                                height: 27,
                                borderRadius: "5px",
                                backgroundColor: theme.palette.success.light,
                                color: theme.palette.success.dark,
                                ml: 2,
                              }}
                            >
                              <PersonalVideoIcon
                                fontSize="small"
                                color="inherit"
                              />
                            </Avatar>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Grid container direction="column">
                  <Grid item>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="subtitle1" color="inherit">
                          IMEI Number
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
                              {deviceData?.imeiNumber}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 27,
                                height: 27,
                                borderRadius: "5px",
                                backgroundColor: theme.palette.orange.light,
                                color: theme.palette.orange.dark,
                                ml: 2,
                              }}
                            >
                              <ListIcon fontSize="small" color="inherit" />
                            </Avatar>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Grid container direction="column">
                  <Grid item>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="subtitle1" color="inherit">
                          Device connected via Data/WiFi
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
                              {deviceData?.isConnectedWithWifi === true
                                ? "WiFi"
                                : "Mobile Data"}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 27,
                                height: 27,
                                borderRadius: "5px",
                                backgroundColor: theme.palette.orange.light,
                                color: theme.palette.orange.dark,
                                ml: 2,
                              }}
                            >
                              {deviceData?.isConnectedWithWifi ? (
                                <WifiIcon fontSize="small" color="inherit" />
                              ) : (
                                <NetworkCellIcon
                                  fontSize="small"
                                  color="inherit"
                                />
                              )}
                            </Avatar>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Grid container direction="column">
                  <Grid item>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="subtitle1" color="inherit">
                          Battery Percentage{" "}
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
                              {Math.trunc(Number(deviceData?.batteryPerc))}%
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 27,
                                height: 27,
                                borderRadius: "5px",
                                backgroundColor: theme.palette.orange.light,
                                color: theme.palette.orange.dark,
                                ml: 2,
                              }}
                            >
                              <Battery60Icon fontSize="small" color="inherit" />
                            </Avatar>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
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

      {/* Call Logs & Screen Time Section */}
      <MainCard content={false} title="Call Logs & Total Screen Time" sx={{ mt: 2 }}>
        <CardContent>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={4}>
              <Typography variant="h5" color="inherit" sx={{ mb: 1.5 }}>
                Total Screen Time
              </Typography>
              <Box sx={{ width: "100%", maxWidth: 280, height: 280, margin: "0 auto" }}>
                {topFiveApps.length > 0 ? (
                  <Pie data={screenTimeChartData} options={screenTimeChartOptions} />
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
                          border: `1px solid ${theme.palette.divider}`,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.value !== null ? timeFormat(item.value) : "-"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="h5" color="inherit" sx={{ mb: 1.5 }}>
                Top 10 Callers (All Time)
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  overflowX: "hidden",
                  borderBottom: "none",
                  height: "500px",
                }}
              >
                <CustomDataGridTable
                  columns={callColumns}
                  rows={topCallers}
                  pagination={false}
                  hideFooter={true}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </MainCard>

      {/* Location Section */}
      <MainCard content={false} title="User Locations" sx={{ mt: 2 }}>
        <CardContent>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={4}>
              <OpenStreetMap center={center} zoom={zoom} />
            </Grid>
            <Grid item xs={8}>
              <Box
                sx={{
                  width: "100%",
                  overflowX: "hidden",
                  borderBottom: "none",
                  height: "100%",
                }}
              >
                <CustomDataGridTable
                  columns={locationColumns}
                  rows={locationData}
                  pagination={false}
                  hideFooter={true}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </MainCard>
      {/* )} */}
    </>
  );
};

DeviceInfo.propTypes = {
  isLoading: PropTypes.bool,
};

export default DeviceInfo;
