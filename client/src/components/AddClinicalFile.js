import React, { useState } from 'react';

// antd
import { Button, Form, Input, Select, DatePicker, Card } from 'antd';

// tinyMCE
import { Editor } from "@tinymce/tinymce-react";


// utils
import { getSph, getCyl, getAxis, rxNotationRegex } from '../utils/rxNotation'

// grpahQL
import { CREATE_NEW_CLINICAL_FILE } from '../graphql/mutations';
import { GET_PATIENT, GET_TINYMCE_KEY } from '../graphql/queries';
import { useMutation, useQuery } from '@apollo/client';

const { Option } = Select;

// component
const AddClinicalFile = (props) => {
    const [form] = Form.useForm();

    const { data, loading } = useQuery(GET_TINYMCE_KEY);
    const tinyMceKey = data?.getTinyMCEApiKey?.key || ""

    const [createNewClinicalFile] = useMutation(CREATE_NEW_CLINICAL_FILE);

    // conditionally required if prescription is selected
    const [isPrescription, setIsPrescription] = useState(true);

    const onFinish = (values) => {
        console.log('Success:', values);
        console.log(props.patientId)
        console.log(values.tinyMCEValue?.level.content)

        createNewClinicalFile({
            variables: {
                on_patient_id: props.patientId,
                fileType: values.fileType,
                title: values.title,
                textField: values.tinyMCEValue?.level.content,
                medicareItemCode: values.medicareItemCode,

                pprSphere: values.previousRight ? getSph(values.previousRight) : undefined,
                pprCylinder: values.previousRight ? getCyl(values.previousRight) : undefined,
                pprAxis: values.previousRight ? getAxis(values.previousRight) : undefined,
                pplSphere: values.previousLeft ? getSph(values.previousLeft) : undefined,
                pplCylinder: values.previousLeft ? getCyl(values.previousLeft) : undefined,
                pplAxis: values.previousLeft ? getAxis(values.previousLeft) : undefined,
                ppInterAdd: parseFloat(values.previousInterAdd) || 0,
                ppNearAdd: parseFloat(values.previousNearAdd) || 0,

                gprSphere: values.givenRight ? getSph(values.givenRight) : undefined,
                gprCylinder: values.givenRight ? getCyl(values.givenRight) : undefined,
                gprAxis: values.givenRight ? getAxis(values.givenRight) : undefined,
                gplSphere: values.givenLeft ? getSph(values.givenLeft) : undefined,
                gplCylinder: values.givenLeft ? getCyl(values.givenLeft) : undefined,
                gplAxis: values.givenLeft ? getAxis(values.givenLeft) : undefined,
                gpInterAdd: parseFloat(values.givenInterAdd) || 0,
                gpNearAdd: parseFloat(values.givenNearAdd) || 0
            },
            refetchQueries: [
                {query: GET_PATIENT},
                GET_PATIENT
            ]
        });
        
        props.modalVis(false);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Form
            name="basic"
            labelCol={{
                span: 5
            }}
            wrapperCol={{
                span: 16
            }}
            initialValues={{
                fileType: "prescription"
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >

        <Form.Item
            label="Type"
            name="fileType"
            hasFeedback
            rules={[
            {
                required: true,
                message: "Please select a file type!"
            }
            ]}
        >
            <Select
                placeholder="File type"
                // defaultValue={"Prescription"}
                onChange={(value) => {
                    value === "prescription"
                    ? setIsPrescription(true)
                    : setIsPrescription(false);
                }}
            >
                <Option value="prescription">Prescription</Option>
                <Option value="health check">Health check</Option>
                <Option value="report">Report</Option>
            </Select>
        </Form.Item>

        <Form.Item
            label="Title"
            name="title"
            rules={[
            {
                required: true,
                message: "Please enter a title."
            }
            ]}
        >
            <Input placeholder="New file" />
        </Form.Item>

        <Form.Item
            label="Notes"
            name="tinyMCEValue"
            valuePropName="tinyMCEValue"
            rules={[
            {
                required: true,
                message: "Please input some text!"
            }
            ]}
        >
            {loading ? (
                <></>
            ) : (
                <Editor
                    apiKey={tinyMceKey}
                    init={{
                        menubar: false,
                        plugins: "link image code autoresize lists",
                        toolbar:
                        "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help"
                    }}
                    initialValue="<p>Your notes here</p>"
                />
            )}
        </Form.Item>

        <Form.Item
            label="Recall"
            name="recall"
            rules={[
            {
                validator: async (_, value) => {
                if (!value) return;

                if (value > Date.now()) {
                    return Promise.resolve(); //resolve to say true or it passed
                } else {
                    return Promise.reject(new Error("'title' is must be unique"));
                }
                },
                message: "Please input valid date in the future!"
            }
            ]}
        >
            <DatePicker />
        </Form.Item>

        <Form.Item label="Use notation">
            <span className="ant-form-text">(-/+)0.00/-0.00x000</span>
        </Form.Item>

        <Card style={{marginBottom: 20}}>
            <Form.Item
                label="Previous R"
                name="previousRight"
                rules={[
                {
                    validator: async (_, value) => {
                    if (!value) return;

                    if (rxNotationRegex.test(value)) {
                        return Promise.resolve(); //resolve to say true or it passed
                    } else {
                        return Promise.reject(new Error("Please enter prescription using the correct notation."));
                    }
                    },
                    message: "Please enter prescription using the correct notation."
                }
                ]}
            >
                <Input disabled={!isPrescription} placeholder="(-/+)0.00/-0.00x000" />
            </Form.Item>

            <Form.Item
                label="Previous L"
                name="previousLeft"
                rules={[
                {
                    validator: async (_, value) => {
                    if (!value) return;

                    if (rxNotationRegex.test(value)) {
                        return Promise.resolve(); //resolve to say true or it passed
                    } else {
                        return Promise.reject(new Error("Please enter prescription using the correct notation."));
                    }
                    },
                    message: "Please enter prescription using the correct notation."
                }
                ]}
            >
                <Input disabled={!isPrescription} placeholder="(-/+)0.00/-0.00x000" />
            </Form.Item>

            <Form.Item
                label="Previous Inter add"
                name="previousInterAdd"
                rules={[
                {
                    validator: async (_, value) => {
                    if (!value) return;

                    if (!isNaN(value) && value % 0.25 === 0 && value > 0) {
                        return Promise.resolve(); //resolve to say true or it passed
                    } else {
                        return Promise.reject(new Error("Must be a positive number measured in dioptres (steps of 0.25)."));
                    }
                    },
                    message: "Must be a positive number measured in dioptres (steps of 0.25)."
                }
                ]}
            >
                <Input
                    disabled={!isPrescription}
                    style={{ width: "100px" }}
                    placeholder="Inter Add"
                />
            </Form.Item>

            <Form.Item
                label="Previous Near add"
                name="previousNearAdd"
                rules={[
                {
                    validator: async (_, value) => {
                    if (!value) return;

                    if (!isNaN(value) && value % 0.25 === 0 && value > 0) {
                        return Promise.resolve(); //resolve to say true or it passed
                    } else {
                        return Promise.reject(new Error("Must be a positive number measured in dioptres (steps of 0.25)."));
                    }
                    },
                    message: "Must be a positive number measured in dioptres (steps of 0.25)."
                }
                ]}
            >
                <Input
                    disabled={!isPrescription}
                    style={{ width: "100px" }}
                    placeholder="Inter Add"
                />
            </Form.Item>
        </Card>

        <Card style={{marginBottom: 20}}>
            <Form.Item
                label="Given R"
                name="givenRight"
                rules={[
                {
                    required: isPrescription,
                    validator: async (_, value) => {
                    if (!value) return;

                    if (rxNotationRegex.test(value)) {
                        return Promise.resolve(); //resolve to say true or it passed
                    } else {
                        return Promise.reject(new Error("Please enter prescription using the correct notation."));
                    }
                    },
                    message: "Please enter prescription using the correct notation."
                }
                ]}
            >
                <Input disabled={!isPrescription} placeholder="(-/+)0.00/-0.00x000" />
            </Form.Item>

            <Form.Item
                label="Given L"
                name="givenLeft"
                rules={[
                {
                    required: isPrescription,
                    validator: async (_, value) => {
                    if (!value) return;

                    if (rxNotationRegex.test(value)) {
                        return Promise.resolve(); //resolve to say true or it passed
                    } else {
                        return Promise.reject(new Error("Please enter prescription using the correct notation."));
                    }
                    },
                    message: "Please enter prescription using the correct notation."
                }
                ]}
            >
                <Input disabled={!isPrescription} placeholder="(-/+)0.00/-0.00x000" />
            </Form.Item>

            <Form.Item
                label="Given Inter add"
                name="givenInterAdd"
                rules={[
                {
                    validator: async (_, value) => {
                    if (!value) return;

                    if (!isNaN(value) && value % 0.25 === 0 && value > 0) {
                        return Promise.resolve(); //resolve to say true or it passed
                    } else {
                        return Promise.reject(new Error("Must be a positive number measured in dioptres (steps of 0.25)."));
                    }
                    },
                    message: "Must be a positive number measured in dioptres (steps of 0.25)."
                }
                ]}
            >
                <Input
                disabled={!isPrescription}
                style={{ width: "100px" }}
                placeholder="Inter Add"
                />
            </Form.Item>

            <Form.Item
                label="Near add"
                name="NearAdd"
                rules={[
                {
                    validator: async (_, value) => {
                    if (!value) return;

                    if (!isNaN(value) && value % 0.25 === 0 && value > 0) {
                        return Promise.resolve(); //resolve to say true or it passed
                    } else {
                        return Promise.reject(new Error("Must be a positive number measured in dioptres (steps of 0.25)."));
                    }
                    },
                    message: "Must be a positive number measured in dioptres (steps of 0.25)."
                }
                ]}
            >
                <Input
                    disabled={!isPrescription}
                    style={{ width: "100px" }}
                    placeholder="Inter Add"
                />
            </Form.Item>
        </Card>

        <Form.Item
            label="Medicare item code"
            name="medicareItemCode"
            rules={[
            {
                validator: async (_, value) => {
                if (!value) return;

                if (!isNaN(value)) {
                    return Promise.resolve(); //resolve to say true or it passed
                } else {
                    return Promise.reject(new Error("Must be a number."));
                }
                },
                message: "Must be a number."
            }
            ]}
        >
            <Input
                style={{ width: "100px" }}
                placeholder="Inter Add"
            />
        </Form.Item>

        <Form.Item
            wrapperCol={{
            offset: 5,
            span: 16
            }}
        >
            <Button type="primary" htmlType="submit">
                Add file
            </Button>
        </Form.Item>
    </Form>
  );
};

export default AddClinicalFile;