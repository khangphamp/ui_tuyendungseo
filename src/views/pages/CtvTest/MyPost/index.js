import React, { useEffect, useState } from "react";
import SimpleHeader from "components/Headers/SimpleHeader.js";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Table,
  UncontrolledTooltip,
} from "reactstrap";
import LoadingSpin from "react-loading-spin";
import Select2 from "react-select2-wrapper";
import { getMyPostList } from "api/post";
import { useDebounce } from "hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { useTimer } from "react-timer-hook";
import moment from "moment";
import DetailPost from "./Details";
//api
const Filter = ({ keyword, setKeyword, options, setStatus, status }) => {
  return (
    <>
      <Row>
        <Col className="col-3">
          <Label>Tiêu đề</Label>
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </Col>
        <Col className="col-2">
          <Label>Trạng thái</Label>
          <Select2
            className="form-control"
            defaultValue={status}
            options={{
              placeholder: status === "" ? "Tất cả" : status,
            }}
            data={options}
            onChange={(e) =>
              setStatus(e.target.value === "all" ? "" : e.target.value)
            }
          />
        </Col>
      </Row>
    </>
  );
};

const MyPost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataPostsList, setDataPostsList] = useState([]);
  const [totalPages, setTotalPages] = useState(5);
  const [isFilter, setIsFilter] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const keywordDebouce = useDebounce(keyword, 500);

  const handleGetMyPostList = async () => {
    setLoading(true);
    const res = await getMyPostList(
      pageSize,
      pageIndex,
      keywordDebouce,
      status
    );
    setDataPostsList(res?.data);
    setTotalPages(res?.totalPages);
    setLoading(false);
  };
  useEffect(() => {
    handleGetMyPostList();
  }, [pageIndex, pageSize, keywordDebouce, status]);

  const options = [
    { id: "all", text: "Tất cả" },
    { id: "-1", text: "Hết hạn" },
    { id: "0", text: "Đang viết" },
    { id: "1", text: "Hoàn thành" },
    { id: "2", text: "Đã duyệt" },
    { id: "-2", text: "Không duyệt" },
  ];
  const optionsForStatus = {
    "-1": "Hết hạn",
    "-2": "Không duyệt",
    0: "Đang viết",
    1: "Hoàn thành",
    2: "Đã duyệt",
  };
  function MyTimer({ expiryTimestamp }) {
    const { seconds, minutes, hours } = useTimer({
      expiryTimestamp,
      // onExpire: () => handleFinish(true),
    });

    return (
      <div style={{ textAlign: "start" }}>
        <div>
          <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>{" "}
        </div>
      </div>
    );
  }

  const renderPaginationItemDivs = () => {
    const divs = [];
    for (let i = 1; i <= totalPages; i++) {
      divs.push(
        <PaginationItem className={pageIndex == i && "active"}>
          <PaginationLink
            href="#pablo"
            onClick={(e) => {
              e.preventDefault();
              setPageIndex(i);
            }}
          >
            {i} <span className="sr-only">(current)</span>
          </PaginationLink>
        </PaginationItem>
      );
    }
    return divs;
  };
  return (
    <>
      <SimpleHeader
        name="Bài viết"
        parentName="Quản lí bài viết"
        // isFilter
        // isNew
        setIsFilter={() => setIsFilter(!isFilter)}
        filter={isFilter}
        props={
          <Filter
            keyword={keyword}
            options={options}
            setKeyword={setKeyword}
            setStatus={setStatus}
            status={status}
          />
        }
      />
      <Container className="mt--6" fluid>
        <Row>
          <div className="col">
            <Card>
              <CardHeader className="border-0">
                <h3 className="mb-0">Danh sách bài viết</h3>
              </CardHeader>
              <div
                style={{
                  display: loading ? "block" : "none",
                  textAlign: "center",
                }}
              >
                <div className={"ExampleOfUsage "}>
                  <LoadingSpin />
                </div>
              </div>
              <div style={{ display: loading ? "none" : "block" }}>
                {dataPostsList?.length ? (
                  <>
                    <Table
                      className="align-items-center table-flush"
                      responsive
                    >
                      <thead className="thead-light">
                        <tr>
                          <th className="sort" scope="col">
                            Tiêu đề
                          </th>
                          <th className="sort" scope="col">
                            Mô tả
                          </th>
                          <th className="sort" scope="col">
                            Từ khóa
                          </th>
                          <th className="sort" scope="col">
                            Trạng thái
                          </th>
                          <th scope="col">Hành động</th>
                        </tr>
                      </thead>
                      {/* dữ liệu */}
                      <tbody className="list">
                        {dataPostsList?.map((item) => (
                          <>
                            <tr>
                              <th scope="row">{item?.title}</th>
                              <td className="budget">
                                {item?.description?.length > 50
                                  ? `${item?.description.slice(0, 50)}...`
                                  : item?.description}
                              </td>
                              <td>{item?.keywords?.map((item1) => item1)}</td>
                              <td>
                                {item.status !== 0 ? (
                                  optionsForStatus[item?.status]
                                ) : (
                                  <div
                                    className="d-flex "
                                    style={{ color: "green" }}
                                  >
                                    Đang viết (
                                    <MyTimer
                                      expiryTimestamp={moment(
                                        item?.receive?.deadline
                                      )}
                                    />
                                    )
                                  </div>
                                )}
                              </td>
                              <td className="table-actions">
                                {item.status === 0 && (
                                  <>
                                    <i
                                      className="fa-sharp fa-solid fa-arrow-right"
                                      onClick={navigate(
                                        `/admin/my-test/${item?._id}`
                                      )}
                                    ></i>

                                    {/* <UncontrolledTooltip delay={0}>
                                      Viết tiếp
                                    </UncontrolledTooltip> */}
                                  </>
                                )}
                                {item.status !== 0 && (
                                  <DetailPost id={item?._id} />
                                )}
                              </td>
                            </tr>
                          </>
                        ))}
                      </tbody>
                    </Table>
                    <CardFooter className="py-4">
                      <nav aria-label="...">
                        <Pagination
                          className="pagination justify-content-end mb-0"
                          listClassName="justify-content-end mb-0"
                        >
                          <PaginationItem
                            className={pageIndex == "1" && "disabled"}
                          >
                            <PaginationLink
                              href="#pablo"
                              onClick={(e) => {
                                e.preventDefault();
                                setPageIndex(pageIndex - 1);
                              }}
                              tabIndex="-1"
                            >
                              <i className="fas fa-angle-left" />
                              <span className="sr-only">Previous</span>
                            </PaginationLink>
                          </PaginationItem>
                          {renderPaginationItemDivs()}

                          <PaginationItem
                            className={pageIndex == totalPages && "disabled"}
                          >
                            <PaginationLink
                              href="#pablo"
                              onClick={(e) => {
                                e.preventDefault();
                                setPageIndex(pageIndex + 1);
                              }}
                              tabIndex="1"
                            >
                              <i className="fas fa-angle-right" />
                              <span className="sr-only">Next</span>
                            </PaginationLink>
                          </PaginationItem>
                        </Pagination>
                      </nav>
                    </CardFooter>
                  </>
                ) : (
                  <p className="text-center">Không có dữ liệu</p>
                )}
              </div>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};
export default MyPost;
