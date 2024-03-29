// React
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Ant Design
import { List, Layout, DatePicker, Menu, Button, Card, Modal, Popover } from 'antd';
import {
    EyeOutlined,
    CoffeeOutlined,
    CarOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    SmallDashOutlined,
    StopOutlined,
    PhoneOutlined,
    MailOutlined
  } from '@ant-design/icons';

import moment from 'moment';

// Components
import BookingForm from '../components/BookingForm';
import BookExistingForm from '../components/BookExistingForm';
import SetupBook from '../components/SetupBook';

// grpahQL
import { GET_BOOK_SETUPS } from '../graphql/queries';
import { UPDATE_BOOKING, DELETE_BOOKING } from '../graphql/mutations';
import { useMutation, useQuery } from '@apollo/client';

// Utils
import { getWeek, dateWorker, getTimeRelation } from '../utils/date';
import BookBlocked from '../components/BookBlocked';
import auth from '../utils/auth';

// Ant Design from components
const { Content, Sider } = Layout;
const { RangePicker } = DatePicker;

const Bookings = (props) => {

    // check if loggedin first
    if (!auth.loggedIn()) {
        auth.logout()
        props.setLoggedIn(false)
    }

    //start date and end date for bookings to show
    const [startDate, setStartDate] = useState(getWeek().firstDay);
    const [endDate, setEndDate] = useState(getWeek().lastDay);

    // for booking modal
    const [bookingDate, setBookingDate] = useState('');
    const [bookingStart, setbookingStart] = useState('');
    const [bookingEnd, setbookingEnd] = useState('');

    // mutations for updating bookings and deleteing bookings and creating blockec booking
    const [updateBooking] = useMutation(UPDATE_BOOKING);
    const [deleteBooking] = useMutation(DELETE_BOOKING);

    // get booksetup and bookings
    const { loading, data} = useQuery(GET_BOOK_SETUPS, {
        variables: {
            startDate,
            endDate
        },
        fetchPolicy: "no-cache"
    });
    const bookSetupData = data?.getBookSetups || [];

    // update bookinng function
    const updateBookingFn = (event, action) => {
        // console.log(startDate, endDate)
        updateBooking({
            variables: {
                bookingToUpdateId: event.target.closest("button").getAttribute('data-booking-id'),
                updateAction: action,
                startDate,
                endDate
            },
            refetchQueries: [
                {query: GET_BOOK_SETUPS},
                GET_BOOK_SETUPS
            ]
        })
    }

    // delete bookinng function
    const deleteBookingFn = (event) => {
        // console.log(startDate, endDate)
        deleteBooking({
            variables: {
                bookingToDeleteId: event.target.closest("button").getAttribute('data-booking-id'),
                startDate,
                endDate
            },
            refetchQueries: [
                {query: GET_BOOK_SETUPS},
                GET_BOOK_SETUPS
            ]
        })
    }

    // buttons for popover
    const buttonSet = {
        empty: [
            {text: "Book New", clickFn: function(event){
                setBookingDate(dateWorker(event.target.closest("button").getAttribute('data-date')))
                setbookingStart(dateWorker(event.target.closest("button").getAttribute('data-start-time')))
                setbookingEnd(dateWorker(event.target.closest("button").getAttribute('data-start-time')))
                showModalNewPatient();
            }}, 
            {text: "Book Existing", clickFn: function(event){
                setBookingDate(dateWorker(event.target.closest("button").getAttribute('data-date')))
                setbookingStart(dateWorker(event.target.closest("button").getAttribute('data-start-time')))
                setbookingEnd(dateWorker(event.target.closest("button").getAttribute('data-start-time')))
                showModalExistingPatient();
            }}, 
            {text: "Block", clickFn: function(event){
                setBookingDate(dateWorker(event.target.closest("button").getAttribute('data-date')))
                setbookingStart(dateWorker(event.target.closest("button").getAttribute('data-start-time')))
                setbookingEnd(dateWorker(event.target.closest("button").getAttribute('data-start-time')))
                showModalBlocked();
            }}
        ],
        booked: [
            {text: "Confirm", clickFn: function(event){
                updateBookingFn(event, "confirmed")
            }}, 
            {text: "Arrive", clickFn: function(event){
                updateBookingFn(event, "arrived")
            }}, 
            {text: "Absent", clickFn: function(event){
                updateBookingFn(event, "absent")
            }}, 
            {text: "Cancel", clickFn: function(event){
                deleteBookingFn(event)
            }}
        ],
        absent: [
            {text: "Booked", clickFn: function(event){
                updateBookingFn(event, "booked")
            }}, 
            {text: "Confirm", clickFn: function(event){
                updateBookingFn(event, "confirmed")
            }}, 
            {text: "Arrive", clickFn: function(event){
                updateBookingFn(event, "arrived")
            }}, 
            {text: "Cancel", clickFn: function(event){
                deleteBookingFn(event)
            }}
        ],
        confirmed: [
            {text: "Arrive", clickFn: function(event){
                updateBookingFn(event, "arrived")
            }}, 
            {text: "Absent", clickFn: function(event){
                updateBookingFn(event, "absent")
            }}, 
            {text: "Cancel", clickFn: function(event){
                deleteBookingFn(event)
            }}
        ],
        arrived: [
            {text: "Absent", clickFn: function(event){
                updateBookingFn(event, "absent")
            }}, 
            {text: "Cancel", clickFn: function(event){
                deleteBookingFn(event)
            }}
        ],
        blocked: [
            {text: "Cancel", clickFn: function(event){
                deleteBookingFn(event)
            }}
        ],
        optomBreak: [],
    };

    // get the bookings and booksetup from given time range
    const [bookingList, setBookingList] = useState([]);
    const [nextPatient, setNextPatient] = useState({});

    // populate bookingList
    useEffect(() => {
        let nextPatientSet = false;
        setBookingList([])

        // populate bookingList
        bookSetupData.forEach((day) => {

            // the current time to check whether appt is in the past or future
            // const rightNow = new Date().toISOString()
            // const rightNowUTC = moment(rightNow);
            const rightNowUTC = moment();

            // the dya of this current iteration
            let todaysList = {}
            // const today = new Date(parseInt(day.open_time)).toISOString()
            // const todayUTC = moment.utc(today).subtract(10, 'h');
            const todayUTC = moment(parseInt(day.open_time)).subtract(10, 'h');
            todaysList.date = todayUTC;
            todaysList.isToday = todayUTC.date() === rightNowUTC.date();
            todaysList.list = [];

            // find static times
            // const opening = new Date(parseInt(day.open_time)).toISOString()
            // const openingUTC = moment.utc(opening).subtract(10, 'h');
            const openingUTC = moment(parseInt(day.open_time)).subtract(10, 'h');

            // const closing = new Date(parseInt(day.closing_time)).toISOString()
            // const closingUTC = moment.utc(closing).subtract(10, 'h');
            const closingUTC =  moment(parseInt(day.closing_time)).subtract(10, 'h');

            // const optomBreak = new Date(parseInt(day.optom_break_start)).toISOString()
            // const optomBreakUTC = moment.utc(optomBreak).subtract(10, 'h');
            const optomBreakUTC = moment(parseInt(day.optom_break_start)).subtract(10, 'h');

            // init cursor
            let cursorUTC = moment(openingUTC)
            
            // begin iterating
            while (moment(cursorUTC).isBefore(closingUTC)) {
                let titleTime = `${cursorUTC.hour()}:${String(cursorUTC.minute()).padStart(2, '0')}`
                let slotTaken = false

                // first check for optom break ======================================================================
                if (moment(cursorUTC).isSame(optomBreakUTC)) {
                    todaysList.list.push({
                        time: optomBreakUTC,
                        titleTime: titleTime,
                        titleText: "Optometrist break",
                        popoverTitleText: "Optometrist break",
                        subTitle: "",
                        bookingType: "optom break",
                        bookingStatus: "optomBreak",
                        hasPassed: getTimeRelation(rightNowUTC, optomBreakUTC), //(moment(optomBreakUTC).isBefore(rightNowUTC)),
                        firstName: "",
                        lastName: "",
                        mobileNumber: "",
                        email: ""
                    })
                    slotTaken = true
                }

                // now check bookings ======================================================================
                day.bookings.forEach((booking) => {
                    const bookingTime = new Date(parseInt(booking.booking_start)).toISOString()
                    const bookingTimeUTC = moment.utc(bookingTime).subtract(10, 'h');

                    if (moment(cursorUTC).isSame(bookingTimeUTC)) {
                        // set the next patient
                        if (moment(bookingTimeUTC).isAfter(rightNowUTC) && !nextPatientSet && booking.booking_type !== "blocked") {
                            setNextPatient({
                                id: booking.patient._id,
                                firstName: booking.patient.first_name,
                                lastName: booking.patient.last_name,
                                mobileNumber: booking.patient.mobile_number,
                                email: booking.patient.email,
                                time: titleTime,
                                bookingType: booking.booking_type
                            })

                            nextPatientSet = true
                        }

                        // now go and push the current booking 
                        todaysList.list.push({
                            time: bookingTimeUTC,
                            titleTime: titleTime,
                            titleText: booking.booking_type !== "blocked" ? `${booking.patient.first_name} ${booking.patient.last_name}` : "Blocked",
                            popoverTitleText: booking.booking_type !== "blocked" ? `${booking.patient.first_name} ${booking.patient.last_name}` : "Blocked",
                            subTitle: booking.booking_type !== 'blocked' ? booking.booking_type : "",
                            bookingId: booking._id,
                            bookingType: booking.booking_type,
                            bookingStatus: booking.booking_type !== 'blocked' ? booking.booking_status : "blocked",
                            bookingNote: booking.booking_note,
                            hasPassed: getTimeRelation(rightNowUTC, bookingTimeUTC), //(moment(bookingTimeUTC).isBefore(rightNowUTC)),
                            firstName: booking.patient?.first_name || "blocked",
                            lastName: booking.patient?.last_name || "blocked",
                            mobileNumber: booking.patient?.mobile_number || "",
                            email: booking.patient?.email || "",
                            patientId: booking.patient?._id || "",
                        })
                        slotTaken = true
                    }
                })

                // else just put in empties ======================================================================
                if (!slotTaken) {
                    todaysList.list.push({
                        time: moment(cursorUTC),
                        titleTime: titleTime,
                        titleText: "",
                        popoverTitleText: "available for booking",
                        subTitle: "",
                        bookingType: "empty",
                        bookingStatus: "empty",
                        hasPassed: getTimeRelation(rightNowUTC, cursorUTC), //(moment(cursorUTC).isBefore(moment(rightNowUTC))),
                        firstName: "",
                        lastName: "",
                        mobileNumber: "",
                        email: ""
                    })
                }
                cursorUTC = cursorUTC.add(30, 'm')
            }

            setBookingList(current => [...current, todaysList])
        })
    }, [data])

    // listener for date range picker
    const onPanelChangeShowRange = (value, mode) => {
        setStartDate(value[0].hour(10).minute(0).second(0).millisecond(0).toDate());
        setEndDate(value[1].hour(10).minute(0).second(0).millisecond(0).toDate());
        // setStartDate(value[0].toDate());
        // setEndDate(value[1].add(23, 'h').toDate());

        console.log(startDate)
        // console.log(startDate.toISOString())
        console.log(endDate)
        // console.log(endDate.toISOString())
    };

    // sub nav options
    const subNav = [
        {
            key: 'sub1',
            label: 'Show Range',
            children: [
                {
                    key: 'sub1option1',
                    label: (    
                        <div>
                            <RangePicker size={"small"} format={[ "DD MMM", "YYYY-MM-DDTHH:mm:ss"]} defaultValue={[moment(startDate, "YYYY-MM-DDT00:00:00+00.00"), moment(endDate, "YYYY-MM-DDT00:00:00+00.00")]} onChange={onPanelChangeShowRange}/>
                            <Button type="primary">Button</Button>
                        </div>
                    )
                }
            ]
        },
        {
            key: 'sub2',
            label: 'Next Appt. Details',
            children: [
                {
                    key: 'sub2option1',
                    label: (  
                        <Card className="next-patient-card">
                            <Link to={{ pathname: `/patients/${nextPatient.id}` }} onClick={() => {props.setPage('patients')}}>
                                <h4>{nextPatient.time}</h4>
                                <h4>{`${nextPatient.firstName} ${nextPatient.lastName}`}</h4>
                                <p>{nextPatient.bookingType}</p>
                                <br/>
                                <p><PhoneOutlined /> {nextPatient.mobileNumber}</p>
                                <p><MailOutlined/> {nextPatient.email}</p>
                            </Link>
                        </Card>  
                    )
                }
            ]
        },
        {
            key: 'sub3',
            label: 'Add New Book',
            children: [
                {
                    key: 'sub3option1',
                    label: (    
                        <SetupBook />
                    )
                }
            ]
        }
    ]

    // return conditional icon
    function ConditionalIcon(props) {
        if(props.type === 'General eye test' || props.type === 'general eye test') {
            return <EyeOutlined style={{fontSize: '20px', margin: 'auto 10px'}}/>
        } else if (props.type === 'health concern') {
            return <ExclamationCircleOutlined style={{fontSize: '20px', margin: 'auto 10px'}}/>
        } else if (props.type === 'rms form') {
            return <CarOutlined style={{fontSize: '20px', margin: 'auto 10px'}}/>
        } else if (props.type === 're-check') {
            return <ReloadOutlined style={{fontSize: '20px', margin: 'auto 10px'}}/>
        } else if (props.type === 'other') {
            return <SmallDashOutlined style={{fontSize: '20px', margin: 'auto 10px'}}/>
        } else if (props.type === 'optom break') {
            return <CoffeeOutlined style={{fontSize: '20px', margin: 'auto 10px'}}/>
        } else if (props.type === 'blocked') {
            return <StopOutlined style={{fontSize: '20px', margin: 'auto 10px'}}/>
        } else {
            // return <ClockCircleOutlined style={{fontSize: '20px', margin: 'auto 10px'}}/>
        }
    }

    // MODAL - NEW PATIENT
    const [isModalVisibleNewPatient, setIsModalVisibleNewPatient] = useState(false);
    const showModalNewPatient = () => {
      setIsModalVisibleNewPatient(true);
    };
    const handleOkNewPatient = () => {
      setIsModalVisibleNewPatient(false);
    };
    const handleCancelNewPatient = () => {
        setIsModalVisibleNewPatient(false);
        setBookingDate('')
        setbookingStart('')
        setbookingEnd('')
    };
    // END MODAL - NEW PATIENT

    // MODAL - EXISTING PATIENT
    const [isModalVisibleExistingPatient, setIsModalVisibleExistingPatient] = useState(false);
    const showModalExistingPatient = () => {
      setIsModalVisibleExistingPatient(true);
    };
    const handleOkExistingPatient = () => {
      setIsModalVisibleExistingPatient(false);
    };
    const handleCancelExistingPatient = () => {
      setIsModalVisibleExistingPatient(false);
      setBookingDate('')
      setbookingStart('')
      setbookingEnd('')
    };
    // END MODAL - EXISTING PATIENT

    // MODAL - BLOCKED
    const [isModalVisibleBlocked, setIsModalVisibleBlocked] = useState(false);
    const showModalBlocked = () => {
      setIsModalVisibleBlocked(true);
    };
    const handleOkBlocked = () => {
      setIsModalVisibleBlocked(false);
    };
    const handleCancelBlocked = () => {
      setIsModalVisibleBlocked(false);
      setBookingDate('')
      setbookingStart('')
      setbookingEnd('')
    };
    // END MODAL - BLOCKED

    return (
        <Content style={{padding: '20px'}}>
            <Modal title="Book new patient" visible={isModalVisibleNewPatient} onOk={handleOkNewPatient} onCancel={handleCancelNewPatient} footer={null}>
                <BookingForm bookingDate={bookingDate} bookingStart={bookingStart} bookingEnd={bookingEnd} modalVis={setIsModalVisibleNewPatient}/>
            </Modal>
            <Modal title="Book existing patient" visible={isModalVisibleExistingPatient} onOk={handleOkExistingPatient} onCancel={handleCancelExistingPatient} footer={null}>
                <BookExistingForm bookingDate={bookingDate} bookingStart={bookingStart} bookingEnd={bookingEnd} modalVis={setIsModalVisibleExistingPatient}/>
            </Modal>
            <Modal title="Block this time out" visible={isModalVisibleBlocked} onOk={handleOkBlocked} onCancel={handleCancelBlocked} footer={null}>
                <BookBlocked bookingDate={bookingDate} bookingStart={bookingStart} bookingEnd={bookingEnd} modalVis={setIsModalVisibleBlocked}/>
            </Modal>
            <h1>Bookings</h1>
            <Layout>
                <Sider width={220} className="site-layout-background">
                    <Menu mode="inline" style={{height: '100%'}} items={subNav} />
                </Sider>
                <Layout style={{padding: '0 24px 24px'}}>
                    <Content className="site-layout-background" style={{ padding: "20 0", margin: 0, minHeight: 280 }}>
                        {loading ? (
                            <h1>loading</h1>
                        ) : (
                            <div style={{
                                display:"flex",
                            }}>
                                {bookingList.map((day) => {
                                    return (
                                        <List
                                            header={<div style={{ fontStyle: day.isToday ? "italic" : "initial", fontWeight: day.isToday ? "bold" : "initial" }}>{day.date.format('ddd MMM Do, YYYY')}</div>}
                                            bordered
                                            itemLayout="horizontal"
                                            dataSource={day.list}
                                            style={{
                                                marginRight: "20px",
                                                width: '100%'
                                            }}
                                            renderItem={(item) => (
                                                <List.Item className={`${item.bookingStatus} ${item.hasPassed} appt-li`}>
                                                    <Popover
                                                        title={
                                                            item.patientId ? (
                                                                <>
                                                                    <span>{item.titleTime} - </span><Link to={{ pathname: `/patients/${item.patientId}` }} onClick={() => {props.setPage('patients')}}>{item.popoverTitleText}</Link>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>{item.titleTime} - </span><>{item.popoverTitleText}</>
                                                                </>
                                                            )
                                                        }
                                                        placement="right"
                                                        content={
                                                            <div className={"booking-card"}>
                                                                {item.email !== "" ? (
                                                                    <>
                                                                        <h4>Booking reason:</h4> {item.subTitle.charAt(0).toUpperCase() + item.subTitle.slice(1)}
                                                                        <br/>
                                                                        <br/>
                                                                        <div style={{marginBottom: '10px'}}>
                                                                            <p><PhoneOutlined /> {item.mobileNumber}</p>
                                                                            <p><MailOutlined /> {item.email}</p>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                                
                                                                {item.bookingNote ? (
                                                                    <>
                                                                        <h4>Bookings notes:</h4>
                                                                        <Card className={"booking-note"}>
                                                                            {item.bookingNote}
                                                                        </Card>
                                                                    </>
                                                                ) : (
                                                                    <></>
                                                                )}

                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        justifyContent: "space-between"
                                                                    }}
                                                                >
                                                                    {buttonSet[item.bookingStatus].map((btn) => {
                                                                        return (
                                                                            <Button
                                                                                data-date={new Date(day.date.toISOString())}
                                                                                data-start-time={new Date(item.time.toISOString())}
                                                                                data-booking-id={item.bookingId}
                                                                                data-booking-action={btn.text}
                                                                                onClick={btn.clickFn}
                                                                            >
                                                                                {btn.text}   
                                                                            </Button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        }
                                                    >
                                                        <div style={{display:"flex", width: "100%", padding: item.bookingType === "empty" ? "0 0 0 10px" : "0"}}> 
                                                            <ConditionalIcon type={item.bookingType} />
                                                            <div style={{display:"flex", flexDirection:"column", width: "100%", padding: "0"}}>
                                                                {<h4 style={{margin: 0}}>{item.titleTime}</h4>}
                                                                {<h4 style={{margin: 0}}>{`${item.titleText}${!!item.bookingNote ? '*' : ''}`}</h4>}
                                                            </div>
                                                        </div>
                                                    </Popover>
                                                </List.Item>
                                            )}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </Content>
                </Layout>
            </Layout>
        </Content>
    )
}

export default Bookings;