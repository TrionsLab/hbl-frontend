import { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Button,
  message,
  Popconfirm,
  Card,
  Space,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  getReceptions,
  updateReception,
  deleteReception,
} from "../../api/receptionService";
import { register } from "../../api/authService";
import SideNavbar from "../../components/common/SideNavbar";

const Reception = () => {
  const [receptions, setReceptions] = useState([]);
  const [filteredReceptions, setFilteredReceptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReception, setEditingReception] = useState(null);

  const [form] = Form.useForm();

  // ✅ Centralized error handler
  const showError = (err, fallback = "Something went wrong") => {
    const msg = err?.response?.data?.message || err?.message || fallback;
    message.error(msg);
  };

  const fetchReceptions = async () => {
    setLoading(true);
    try {
      const res = await getReceptions();
      const data = Array.isArray(res.data) ? res.data : [];
      setReceptions(data);
      setFilteredReceptions(data); // ✅ set filtered version initially
    } catch (err) {
      showError(err, "Failed to load receptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptions();
  }, []);

  const handleSearch = (value) => {
    const query = value.toLowerCase();
    const filtered = receptions.filter(
      (item) =>
        item.username.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query)
    );
    setFilteredReceptions(filtered);
  };

  const handleAdd = () => {
    setEditingReception(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingReception(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteReception(id);
      message.success("Receptionist deleted");
      fetchReceptions();
    } catch (err) {
      showError(err, "Delete failed");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingReception) {
        await updateReception(editingReception.id, {
          username: values.username,
          email: values.email,
          ...(values.password ? { password: values.password } : {}),
        });
        message.success("Receptionist updated");
      } else {
        await register({ ...values, role: "reception" });
        message.success("Receptionist added");
      }

      setIsModalOpen(false);
      fetchReceptions();
      form.resetFields();
    } catch (err) {
      showError(err, "Operation failed");
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this receptionist?"
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
    <div className="flex h-screen">
      <SideNavbar />
      <div className="flex-1 p-4 overflow-hidden bg-gray-50">
        <Card
          className="h-full shadow-sm rounded-xl flex flex-col bg-white"
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Reception Management</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Receptionist
            </Button>
          </div>

          <Input
            placeholder="Search by username or email"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: 12, maxWidth: 300 }}
          />

          <div className="flex-1 overflow-auto">
            <Table
              dataSource={
                Array.isArray(filteredReceptions) ? filteredReceptions : []
              }
              columns={columns}
              rowKey="id"
              loading={loading}
              size="middle"
              bordered
              scroll={{ y: "calc(100vh - 250px)" }}
            />
          </div>

          <Modal
            title={editingReception ? "Edit Receptionist" : "Add Receptionist"}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={() => setIsModalOpen(false)}
            okText={editingReception ? "Update" : "Create"}
            destroyOnClose
          >
            <Form form={form} layout="vertical" className="space-y-2">
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Please enter username" }]}
              >
                <Input placeholder="Username" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Enter valid email" },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  editingReception ? "New Password (optional)" : "Password"
                }
                rules={
                  editingReception
                    ? []
                    : [{ required: true, message: "Please enter password" }]
                }
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </div>
    </div>
  );
};

export default Reception;
