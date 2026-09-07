import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Avatar, CardContent, Divider, Grid, Typography } from "@mui/material";

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
import { useDispatch } from "react-redux";
import { setimeiNumber } from "store/reducers/deviceDataSlice";

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
      {/* )} */}
    </>
  );
};

DeviceInfo.propTypes = {
  isLoading: PropTypes.bool,
};

export default DeviceInfo;
