import { useEffect, useState } from "react";
import {
  getReferences,
  addReference,
  deleteReference,
  updateReference,
} from "../../api/referralManagerApi.js";
import SideNavbar from "../../components/common/SideNavbar.jsx";
import {
  Table,
  Input,
  Button,
  Form,
  Select,
  Space,
  Modal,
  message,
  Card,
  Row,
  Col,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const ReferenceManager = () => {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    setLoading(true);
    try {
      const data = await getReferences();
      setReferences(data);
    } catch (err) {
      message.error("Failed to load references.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editId) {
        await updateReference(editId, values);
        message.success("Reference updated successfully");
      } else {
        await addReference(values);
        message.success("Reference added successfully");
      }
      form.resetFields();
      setEditId(null);
      loadReferences();
    } catch (err) {
      if (err.response?.status === 409) {
        message.error(
          "A reference with this code already exists. Please use a different code."
        );
      } else {
        message.error("An error occurred. Please try again.");
      }
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this reference?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteReference(id);
          message.success("Reference deleted successfully");
          loadReferences();
        } catch {
          message.error("Failed to delete the reference.");
        }
      },
    });
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditId(record.id);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredReferences = references.filter(
    (ref) =>
      ref.name.toLowerCase().includes(searchText.toLowerCase()) ||
      ref.code.toLowerCase().includes(searchText.toLowerCase()) ||
      ref.type.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Code", dataIndex: "code", key: "code" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="danger"
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavbar />
      <div className="flex-1 p-8 space-y-6 flex flex-col">
        {/* Form Card - 50% width */}
        <Card title="Add / Edit Reference" bordered className="w-full md:w-1/2">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ type: "Doctor" }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input placeholder="Name" />
            </Form.Item>

            <Form.Item
              label="Code"
              name="code"
              rules={[{ required: true, message: "Please enter code" }]}
            >
              <Input placeholder="Code" />
            </Form.Item>

            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select>
                <Option value="Doctor">Doctor</Option>
                <Option value="PC">PC</Option>
              </Select>
            </Form.Item>

            <Form.Item className="flex justify-start">
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                {editId ? "Update Reference" : "Add Reference"}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Table Card - full width */}
        <Card title="Reference List" bordered className="w-full">
          <Input
            placeholder="Search by name, code, or type..."
            value={searchText}
            onChange={handleSearch}
            prefix={<SearchOutlined />}
            allowClear
            className="mb-4"
          />

          {loading ? (
            <div className="flex justify-center p-6">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={filteredReferences}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReferenceManager;
