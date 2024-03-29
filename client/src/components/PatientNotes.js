// React
import React, { useState } from 'react';

// Ant Design
import { List, Layout, Button, Modal } from 'antd';
import {
    EditOutlined
  } from '@ant-design/icons';

// graphQL
import AddNote from './AddNote';
import ViewNote from './ViewNote';

// Ant Design from components
const { Content } = Layout;

const PatientNotes = (props) => {
    const parsedPatientNotes = props.patient.notes

    const patientId = props.patient._id

    // selected clinical file
    const [selectedNote, setSelectedNote] = useState({});

    // ADD MODAL
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
      setIsModalVisible(true);
    };
  
    const handleOk = () => {
      setIsModalVisible(false);
    };
  
    const handleCancel = () => {
      setIsModalVisible(false);
    };

    // END VIEW MODAL

    // ADD MODAL
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const showAddModal = () => {
        setIsAddModalVisible(true);
    };
    const handleAddOk = () => {
        setIsAddModalVisible(false);
    };
    const handleAddCancel = () => {
        setIsAddModalVisible(false);
    };
    // END ADD MODAL

    return (
        <Content>
            <Modal title="View file" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} width={1000} footer={null}>
                <ViewNote patientId={patientId} selectedNoteData={selectedNote} modalVis={setIsModalVisible}/>
            </Modal>
            <Modal title="Add new clinical file" visible={isAddModalVisible} onOk={handleAddOk} onCancel={handleAddCancel} width={1000} footer={null}>
                <AddNote patientId={patientId} modalVis={setIsModalVisible}/>
            </Modal>
            <Layout>
                <Content className="site-layout-background" style={{ padding: 0, margin: 0, minHeight: 280 }}>
                    <List
                        header={`Number of records: ${parsedPatientNotes.length}`}
                        bordered
                        itemLayout="horizontal"
                        dataSource={parsedPatientNotes}
                        renderItem={(item) => (
                            <List.Item className={"patient-file-record-li"}>
                                <div className={"patient-record"} onClick={() => {
                                    setSelectedNote(item)
                                    showModal()
                                }}>
                                    <EditOutlined style={{fontSize: '40px', margin: 'auto 20px'}}/>
                                    <div>
                                        <h3>{`${item.title}`}</h3>
                                        <h4>{new Date(parseInt(item.date_created)).toDateString()} </h4>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                    <Button style={{  marginTop: 10 }} onClick={showAddModal}>
                        Add new note
                    </Button>
                </Content>
            </Layout>
        </Content>
    )
}

export default PatientNotes;