import React, { useState } from "react";
import Box from "@mui/material/Box";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import Modal from "@mui/material/Modal";
import { GridActionsCellItem } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { extractDate, extractTime, formatDate, formatTimestampToTime } from "helper/GetDateTimeFormat";
import { Typography, Grid, Divider, CardContent, Checkbox, Button } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import CustomDatePicker from "helper/CustomDatePicker";
import CustomDataGridTable from "helper/CustomDataGridTable";
import { useFetchData } from "helper/useFetchData";
import { GET_GMAILS_LOGS } from "config/ApiNameConstant";
import ApiUtils from "api/ApiUtils";
import CommonDeleteModal from "views/CommonDeleteModal";
import useCommonCheckbox from "views/useCommonCheckbox";
import CommonModal from "views/CommonModal";
import { FaTrash } from "react-icons/fa6";
import { getParamUrl } from "helper/UrlHelper";

const GmailLogs = () => {
  const urlParam = useParams();
  const userDeviceIdAsNumber = urlParam.userDeviceId;
  const [chatData, setChatData] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [filterModel, setFilterModel] = useState({
    fromDate: '',
    toDate: '',
  });
  let params = getParamUrl(filterModel,
    userDeviceIdAsNumber,
    currentPageNumber);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [openExcelModal, setOpenExcelModal] = useState(false);
  const { totalCount, data, fetchData } = useFetchData(
    GET_GMAILS_LOGS,
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
  } = useCommonCheckbox(data, "gmailId");

  const handleDelete = async (checkedIds, setParentChecked, setChildCheckedState) => {
    const selectedEmails = data
      ?.filter((item) => checkedIds.includes(item.gmailId))
      .flatMap((item) => [item.fromEmail, item.toEmail].filter(Boolean));

    const uniqueEmails = [...new Set(selectedEmails)];

    const bodyData = {
      deviceUserId: Number(userDeviceIdAsNumber),
      searchField: uniqueEmails,
    };

    await CommonDeleteModal({
      data: bodyData,
      fetchData,
      onError: (error) => console.error("Delete error:", error),
      deleteFuntion: ApiUtils.DeleteGroupRange,
      Url: "Gmail/DeleteGroupData",
      setParentChecked,
      setChildCheckedState,
    });
  };
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    height: 600,
    borderRadius: "12px",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  function fetchDataofChats(params) {
    ApiUtils.getGmailsLogs(params)
      .then((res) => {
        const dataTable = res.data.data.listResponse.map((data, index) => ({
          ...data,
          id: index + 1,
          time: extractTime(data.mailLogTime),
          date: extractDate(data.mailLogTime),
        }));
        setChatData(dataTable);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleExportFile = (fromDateISOString, toDateISOString) => {
    const paramsForExcel = `DeviceUserId=${userDeviceIdAsNumber}&Page=${currentPageNumber}&PageSize=10&FromDate=${fromDateISOString}&ToDate=${toDateISOString}`;
    ApiUtils.getGmailLogDetailsByExcel(paramsForExcel)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "gmail-logs.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  };

  const showChatModal = (mailId) => {
    const paramsForChat = `DeviceUserId=${userDeviceIdAsNumber}&email=${mailId}`
    fetchDataofChats(paramsForChat)
    setOpen(true);
  };
  const columns = [
    {
      field: "parentBox",
      headerName: (
        <Checkbox
          className="parentCheckbox"
          type="checkbox"
          checked={parentChecked}
          onChange={handleParentCheckboxChange}
        />
      ),
      flex: 0.5,
      type: "actions",
      renderCell: (params) => (
        <Checkbox
          type="checkbox"
          checked={childCheckedState?.includes(params?.row?.gmailId)}
          onChange={(e) => handleChildCheckboxChange(e, params?.row?.gmailId)}
        />
      ),
    },
    { field: "fromEmail", headerName: "From Email ID", flex: 1 },
    { field: "toEmail", headerName: "To Email ID", flex: 1 },
    { field: "subject", headerName: "Subject", flex: 1 },
    {
      field: "time",
      flex: 1,
      headerName: "Time",
      valueGetter: (params) => formatTimestampToTime(params.row.mailLogTime),
    },
    {
      field: "date",
      flex: 1,
      headerName: "Date",
      valueGetter: (params) => formatDate(params.row.mailLogTime),
    },
    {
      field: "actions",
      headerName: "View Chat",
      type: "actions",
      flex: 1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<RemoveRedEyeIcon />}
          label="map"
          onClick={() => showChatModal(params.row.fromEmail)}
        />,
      ],
    },
    {
      field: "delete",
      headerName: "Action",
      flex: 1,
      type: "delete",
      renderCell: (params) => (
        <Button className="link-redirect">
          <FaTrash
            color="red"
            stroke={2}
            onClick={() => handleDelete([params?.row?.gmailId], setParentChecked, setChildCheckedState)}
          />
        </Button>
      ),
    },
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
      <MainCard content={false} title="Gmail Logs">
        <CardContent>
          <Grid container spacing={2}>
            <CustomDatePicker onSearch={handleSearch} onExportExcelFile={handleExportFile} data={data} showExportExcel={true} />
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
                  sx={{ background: "red", borderRadius: "10px", marginLeft: "10px" }}
                  onClick={() => handleDelete(childCheckedState, setParentChecked, setChildCheckedState)}
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
              Gmail Message
            </Typography>
            <CloseIcon className="close-icon-modal" onClick={handleClose} />
          </Box>
          <Divider sx={{ my: 1.5 }} />

          <CardContent
            sx={{ maxHeight: "500px", overflowY: "auto", overflowX: "hidden" }}
          >
            <section className="msger">
              <main className="msger-chat">
                {chatData.length > 0 &&
                  chatData.map((chat, i) => {
                    return (
                      <div
                        key={i}
                        className={
                          chat.mailType === "Incoming"
                            ? "msg left-msg"
                            : "msg right-msg"
                        }
                      >
                        <div className="msg-bubble">
                          <div>
                            <div className="msg-info-time">
                              {chat.time} {chat.date}
                            </div>
                            <div className="msg-info">
                              <div className="msg-info-name">
                                <strong>From:</strong> {chat.fromEmail}
                              </div>
                              <div className="msg-info-name">
                                <strong>To:</strong> {chat.toEmail}
                              </div>
                              {chat.ccEmail && (
                                <div className="msg-info-name">
                                  <strong>CC:</strong> {chat.ccEmail}
                                </div>
                              )}
                              {chat.bccEmail && (
                                <div className="msg-info-name">
                                  <strong>BCC:</strong> {chat.bccEmail}
                                </div>
                              )}
                            </div>
                            {chat.subject && (
                              <div className="msg-info-name">
                                <strong>Subject:</strong> {chat.subject}
                              </div>
                            )}
                          </div>
                          <div className="msg-text">{chat.messageBody}</div>
                        </div>
                      </div>
                    );
                  })}
              </main>
            </section>
          </CardContent>
        </Box>
      </Modal>
      <CommonModal
        userDeviceId={userDeviceIdAsNumber}
        open={openExcelModal}
        setOpenExcelModal={setOpenExcelModal}
        title="Gmail Logs Import"
        fetchData={fetchData}
        Url="Gmail/BulkImport"
      />
    </>
  );
};

export default GmailLogs;
