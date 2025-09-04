import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { createTest, updateTest, deleteTest, fetchTests } from "../../api/testApi";

const Test = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await fetchTests();
      setTests(data);
    } catch (err) {
      message.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleAddEdit = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editingTest) {
          await updateTest(editingTest.id, values);
          message.success("Test updated successfully");
        } else {
          await createTest(values);
          message.success("Test created successfully");
        }
        setIsModalOpen(false);
        setEditingTest(null);
        form.resetFields();
        loadTests();
      } catch (err) {
        message.error("Something went wrong");
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteTest(id);
      message.success("Test deleted successfully");
      loadTests();
    } catch (err) {
      message.error("Failed to delete test");
    }
  };

  // Filter and sort tests based on search
  const filteredTests = tests
    .filter(
      (test) =>
        test.code.toString().includes(searchText) ||
        test.description.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => Number(a.code) - Number(b.code)); // sort by code serial

  const columns = [
    { title: "Code", dataIndex: "code", key: "code", sorter: (a, b) => Number(a.code) - Number(b.code) },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Rate (Tk.)", dataIndex: "rate", key: "rate", sorter: (a, b) => a.rate - b.rate },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingTest(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by code or description"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1); // reset to first page on search
          }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTest(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Add Test
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredTests}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredTests.length,
          onChange: (page) => setCurrentPage(page),
        }}
      />

      <Modal
        title={editingTest ? "Edit Test" : "Add Test"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingTest(null);
        }}
        onOk={handleAddEdit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: "Please enter test code" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter test description" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Rate (Tk.)"
            name="rate"
            rules={[{ required: true, message: "Please enter test rate" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Test;
